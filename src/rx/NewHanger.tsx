import anime from "animejs/lib/anime.es.js";
import React, { useRef } from "react";
import { useThree } from "react-three-fiber";
import { fromEvent } from "rxjs";
import { map, takeLast, takeUntil, throttleTime } from "rxjs/operators";
import * as THREE from "three";
import { NormalBlending } from "three";
import { GRID_SIZE, useStore } from ".";
import { pointsToThreeShape } from "../utils";
import { coplanarStuff } from "./utils";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersects = new THREE.Vector3();
const plane = new THREE.Plane();

const linesMaterial = new THREE.LineBasicMaterial({
  color: "#50BFE6",
  blending: NormalBlending,
  depthTest: false,
});

const hangerMaterials = [
  new THREE.MeshBasicMaterial({
    opacity: 0,
    transparent: true,
  }),
  new THREE.MeshBasicMaterial({
    color: "#50B8F8",
    opacity: 0.1,
    transparent: true,
    // blending: MultiplyBlending,
  }),
  new THREE.MeshBasicMaterial({
    color: "#66FF66",
    opacity: 0.6,
    transparent: true,
  }),
  new THREE.MeshBasicMaterial({
    color: "#FF355E",
    opacity: 0.6,
    transparent: true,
    // blending: MultiplyBlending,
  }),
];

const snapToGridX = (val: number, includeSubGrid = false): number => {
  let modifier = 0;

  if (includeSubGrid) {
    const vals = [0, 1.2, 1.8, 3.9, 4.5, GRID_SIZE.x];

    const remainder = val % GRID_SIZE.x;

    modifier = vals.reduce((prev: number, curr: number) =>
      Math.abs(curr - remainder) < Math.abs(prev - remainder) ? curr : prev
    );

    if (modifier > GRID_SIZE.x / 2) modifier -= GRID_SIZE.x;
  }

  return Math.round(val / GRID_SIZE.x) * GRID_SIZE.x + modifier;
};

const NewHanger = () => {
  const [hangerPoints, set, controlsEnabled] = useStore((store) => [
    store.hangerPoints,
    store.set,
    store.controlsEnabled,
  ]);

  const edges = useRef(null);
  const { viewport, camera } = useThree();

  const groundPoints = pointsToThreeShape(hangerPoints);

  const geometry = new THREE.ExtrudeGeometry(groundPoints, {
    depth: GRID_SIZE.y,
    steps: 2,
    bevelEnabled: false,
  });

  // geometry.rotateX(-Math.PI / 2);
  // geometry.translate(-h.width / 2, 0, h.length / 2);
  // const position = new THREE.Vector3();
  // const rotation = new THREE.Euler(0, 0, 0);

  // GRID_SIZE.x / 2 - h.width
  const position = new THREE.Vector3(
    // -GRID_SIZE.x / 2,
    -GRID_SIZE.x / 2,
    0,
    (GRID_SIZE.z * 3) / 2
  );
  const rotation = new THREE.Euler(-Math.PI / 2, 0);

  geometry.faces.forEach((face) => (face.materialIndex = 0));

  const edgesGeometry = new THREE.EdgesGeometry(geometry);

  const handlePointerDown = (e) => {
    e.stopPropagation();

    set((draft) => {
      draft.controlsEnabled = false;
    });

    const { normal, a, b, c } = e.face as THREE.Face3;
    const { geometry } = e.object as THREE.Mesh;

    if (geometry instanceof THREE.Geometry) {
      const { vertices: allVertices, sharedAxis: axis, faces } = coplanarStuff(
        geometry,
        e.face
      );

      // if vertical drag then cancel drag
      if (axis === "z") return;

      // faces.forEach((face) => (face.materialIndex = 1));

      const toAdd = normal.clone().multiplyScalar(e.buttons === 1 ? 1 : -1);

      plane.setFromCoplanarPoints(
        allVertices[0].clone(),
        allVertices[1].clone().sub(toAdd),
        allVertices[1].clone().add(toAdd)
      );

      const origVertices = allVertices.map((v) => v.clone());

      let startPos;

      const up$ = fromEvent(document, "pointerup");

      const e$ = fromEvent(document, "pointermove").pipe(
        throttleTime(25),
        map((ev: PointerEvent) => {
          mouse.x = (ev.clientX / viewport.width) * 2 - 1;
          mouse.y = -(ev.clientY / viewport.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          raycaster.ray.intersectPlane(plane, intersects);
          startPos = startPos || intersects[axis];
          return intersects[axis] - startPos;
        }),
        takeUntil(up$)
      );

      up$.subscribe(() => {
        // faces.forEach((face) => (face.materialIndex = 0));
        set((draft) => {
          draft.controlsEnabled = true;
        });
      });

      const deltaSign = normal.x === 1 ? 1 : -1;

      // TODO remove this hack!
      // const deltaSign = [0, 1, 4, 5, 8, 9].includes(e.faceIndex) ? 1 : -1;

      let extrudeDistance: number;
      const extrude = (delta) => {
        extrudeDistance = delta * deltaSign;
        const toAddAgain = normal.clone().multiplyScalar(extrudeDistance);

        // console.log("set face");
        faces.forEach((face) => {
          if (Math.abs(extrudeDistance) < 0.2) {
            face.materialIndex = 1;
          } else if (extrudeDistance > 0) {
            face.materialIndex = 2;
          } else {
            face.materialIndex = 3;
          }
        });

        // faces.forEach((face) => {
        //   face.materialIndex = 2;
        //   console.log(face);
        //   // geometry.colorsNeedUpdate = true; //deltaSign > 0 ? 3 : 2;
        // });

        allVertices.forEach((v, i) => {
          v.copy(origVertices[i].clone().add(toAddAgain));
        });

        geometry.groupsNeedUpdate = true;
        geometry.verticesNeedUpdate = true;
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        edges.current.geometry.dispose();
        edges.current.geometry = new THREE.EdgesGeometry(geometry);
      };

      e$.subscribe((delta) => {
        extrude(delta);
      });

      e$.pipe(takeLast(1)).subscribe((delta) => {
        const targets = {
          delta,
        };

        let roundedDelta: number;
        if (axis === "x") {
          roundedDelta = snapToGridX(delta, true);
        } else {
          roundedDelta = Math.round(delta / GRID_SIZE[axis]) * GRID_SIZE[axis];
        }

        anime({
          targets,
          duration: 0,
          delta: roundedDelta,
          update: function () {
            extrude(targets.delta);
          },
          easing: "easeOutQuint",
        });

        set((draft) => {
          draft.hangerPoints = geometry.vertices
            .filter(({ z }) => z === 0)
            .map(({ x, y, z }) => [
              // Math.round(x / GRID_SIZE.x) * GRID_SIZE.x,
              snapToGridX(x, true),
              Math.round(y / GRID_SIZE.z) * GRID_SIZE.z,
            ]);
        });
      });
    }
  };

  return (
    <group position={position} rotation={rotation} name="hanger">
      <mesh
        geometry={geometry}
        material={hangerMaterials}
        onPointerDown={handlePointerDown}
      />
      {!controlsEnabled && (
        <lineSegments ref={edges} args={[edgesGeometry, linesMaterial]} />
      )}
    </group>
  );
};

export default NewHanger;
