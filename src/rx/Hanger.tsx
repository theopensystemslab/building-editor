import anime from "animejs/lib/anime.es.js";
import React, { useRef } from "react";
import { useThree } from "react-three-fiber";
import { fromEvent } from "rxjs";
import { map, takeLast, takeUntil, throttleTime } from "rxjs/operators";
import {
  AdditiveBlending,
  BoxGeometry,
  EdgesGeometry,
  Geometry,
  LineBasicMaterial,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import { GRID_SIZE, useStore } from ".";
import { coplanarStuff } from "./utils";

const raycaster = new Raycaster();
const mouse = new Vector2();
let intersects = new Vector3();

const linesMaterial = new LineBasicMaterial({
  color: "#50B8F8",
});

const Hanger = () => {
  const { viewport, camera } = useThree();

  const [hanger, set] = useStore((store) => [store.hanger, store.set]);

  const edges = useRef(null);
  const plane = new Plane();

  const boxGeometry = new BoxGeometry(
    hanger.width,
    hanger.height,
    hanger.length
  );
  boxGeometry.translate(0, hanger.height / 2, 0);

  const edgesGeometry = new EdgesGeometry(boxGeometry);

  return (
    <>
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();

          set((draft) => {
            draft.controlsEnabled = false;
          });

          const { normal, a, b, c } = e.face as THREE.Face3;
          const { geometry } = e.object as THREE.Mesh;

          if (geometry instanceof Geometry) {
            const { vertices } = geometry;

            const {
              vertices: allVertices,
              sharedAxis: axis,
            } = coplanarStuff(geometry, [
              vertices[a],
              vertices[b],
              vertices[c],
            ]);

            const toAdd = normal
              .clone()
              .multiplyScalar(e.buttons === 1 ? 1 : -1);

            plane.setFromCoplanarPoints(
              allVertices[0].clone(),
              allVertices[1].clone().sub(toAdd),
              allVertices[1].clone().add(toAdd)
            );

            const origVertices = allVertices.map((v) => v.clone());

            let startPos;

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
              takeUntil(fromEvent(document, "pointerup"))
            );

            // TODO remove this hack!
            const deltaSign = [0, 1, 4, 5, 8, 9].includes(e.faceIndex) ? 1 : -1;

            const extrude = (delta) => {
              const toAddAgain = normal
                .clone()
                .multiplyScalar(delta * deltaSign);
              allVertices.forEach((v, i) => {
                v.copy(origVertices[i].clone().add(toAddAgain));
              });

              geometry.verticesNeedUpdate = true;
              geometry.computeBoundingSphere();
              geometry.computeFaceNormals();
              geometry.computeVertexNormals();

              edges.current.geometry.dispose();
              edges.current.geometry = new EdgesGeometry(geometry);
            };

            e$.pipe(takeLast(1)).subscribe((delta) => {
              const targets = {
                delta,
              };

              anime({
                targets,
                duration: 100,
                delta: Math.round(delta / GRID_SIZE[axis]) * GRID_SIZE[axis],
                update: function () {
                  extrude(targets.delta);
                },
                easing: "easeOutQuint",
              });

              set((draft) => {
                // const sizes = {
                //   x: 'width',
                //   y: 'height',
                //   z: 'length',
                // }
                // draft.hanger[sizes[axis]] = Math.round(targets.delta / )
                draft.controlsEnabled = true;
              });
            });

            e$.subscribe((delta) => {
              extrude(delta);
            });
          }
        }}
        geometry={boxGeometry}
      >
        <meshBasicMaterial
          color="#81D7F7"
          opacity={0.025}
          transparent
          attach="material"
          blending={AdditiveBlending}
          visible={false}
        />
      </mesh>

      <lineSegments ref={edges} args={[edgesGeometry, linesMaterial]} />
    </>
  );
};

export default Hanger;
