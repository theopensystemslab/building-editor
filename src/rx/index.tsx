import anime from "animejs/lib/anime.es.js";
import { OrbitControls, Stats, Text } from "drei";
import produce from "immer";
import React, { useEffect, useRef } from "react";
import { Canvas, isOrthographicCamera, useThree } from "react-three-fiber";
import { fromEvent, merge, timer } from "rxjs";
import {
  buffer,
  debounceTime,
  filter,
  flatMap,
  map,
  switchMap,
  takeLast,
  takeUntil,
  throttleTime,
  timeoutWith,
} from "rxjs/operators";
import {
  AdditiveBlending,
  BoxBufferGeometry,
  BoxGeometry,
  Color,
  EdgesGeometry,
  Geometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  Plane,
  Raycaster,
  RepeatWrapping,
  Texture,
  TextureLoader,
  Uncharted2ToneMapping,
  Vector2,
  Vector3,
} from "three";
import create from "zustand";
import RectangularGrid from "../shared/RectangularGrid";
import { coplanarVertices } from "./utils";

const GRID_SIZE = {
  x: 5.7,
  y: 3,
  z: 1.2,
};

enum Actions {
  TAP,
  DOUBLE_TAP,
  TAP_AND_HOLD,
}

enum Tool {
  PAN,
  ZOOM,
  ORBIT,
  EXTRUDE,
  MOVE,
  CLONE,
}

const [useStore] = create((set) => ({
  controlsEnabled: true,
  action: null,
  selected: {
    tool: Tool.MOVE,
    model: null,
  },
  hoveredModel: null,
  set: (fn) => set(produce(fn)),
}));

const InteractionsContainer = ({ children }) => {
  const set = useStore((store) => store.set);
  const ref = useRef(null);

  useEffect(() => {
    const pointerDown$ = fromEvent(ref.current, "pointerdown");
    const pointerUp$ = fromEvent(document, "pointerup");

    const tap$ = pointerDown$.pipe(
      switchMap(() => pointerUp$.pipe(timeoutWith(200, pointerDown$))),
      map(() => Actions.TAP)
    );

    const hold$ = pointerDown$.pipe(
      flatMap(() => timer(250).pipe(takeUntil(pointerUp$))),
      map(() => Actions.TAP_AND_HOLD)
    );

    const doubleTap$ = tap$.pipe(
      buffer(tap$.pipe(debounceTime(300))),
      filter(({ length }) => length === 2),
      map(() => Actions.DOUBLE_TAP)
    );

    const merged$ = merge(tap$, hold$, doubleTap$);

    const actions = merged$.subscribe((val) => {
      set((draft) => {
        draft.action = val;
      });
    });

    const clearIfNothingHappens = merged$
      .pipe(debounceTime(1000))
      .subscribe(() => {
        set((draft) => {
          draft.action = null;
        });
      });

    return () => {
      console.log("unmounting, unsubscribe");
      actions.unsubscribe();
      clearIfNothingHappens.unsubscribe();
    };
  }, [set]);

  return (
    <div
      ref={ref}
      style={{ height: "100%" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};

const raycaster = new Raycaster(); // create once and reuse
const mouse = new Vector2();
let intersects = new Vector3();

const Hanger = () => {
  const { viewport, camera } = useThree();
  const set = useStore((store) => store.set);
  const edges = useRef(null);
  const plane = new Plane();

  const boxGeometry = new BoxGeometry(GRID_SIZE.x, GRID_SIZE.y, GRID_SIZE.z);
  boxGeometry.translate(0, 1.51, 0);
  const edgesGeometry = new EdgesGeometry(boxGeometry);

  const linesMaterial = new LineBasicMaterial({
    color: "#50B8F8",
  });

  return (
    <>
      {/* <planeHelper args={[plane, 10, 0xff0000]} /> */}
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

            const [allVertices, axis] = coplanarVertices(geometry, [
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
          opacity={0.02}
          transparent
          attach="material"
          blending={AdditiveBlending}
        />
      </mesh>
      <lineSegments ref={edges} args={[edgesGeometry, linesMaterial]} />
    </>
  );
};

const Controls = () => {
  const controlsEnabled = useStore((store) => store.controlsEnabled);
  return (
    <OrbitControls
      enabled={controlsEnabled}
      enablePan={false}
      rotateSpeed={0.7}
      dampingFactor={0.1}
      zoomSpeed={2}
      enableDamping
      // minPolarAngle={0}
      maxPolarAngle={Math.PI / 2 - 0.3}
    />
  );
};

const onBeforeRender = (v, normal) =>
  function (renderer, scene, camera, geometry, material, group) {
    if (
      camera.position.y < 17 &&
      v.subVectors(camera.position, this.position).dot(normal) < 0
    ) {
      geometry.setDrawRange(0, 0);
    }
  };
const onAfterRender = (renderer, scene, camera, geometry, material, group) => {
  geometry.setDrawRange(0, Infinity);
};

const tl = new TextureLoader();

const rpt = function (texture: Texture) {
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
};

const a = new MeshStandardMaterial({
  color: "white",
  emissive: new Color(0xf2f2f2),
  emissiveIntensity: 0.2,
  polygonOffsetUnits: 0.1,
  roughness: 2,

  map: tl.load(
    "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster texture.jpg",
    rpt
  ),
  normalMap: tl.load(
    "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster_NORM.jpg",
    rpt
  ),
  bumpMap: tl.load(
    "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster_DISPL.jpg",
    rpt
  ),
  normalScale: new Vector2(1, 0),
});
const b = new MeshBasicMaterial({ color: "#444" });

const wallMaterial = [a, a, b, a, a, a];

const Wall = ({ bg, n, t }) => {
  const v = new Vector3();

  const g = new BoxGeometry(...bg);
  const normal = new Vector3(...n);
  g.translate(t[0], t[1], t[2]);

  return (
    <mesh
      onAfterRender={onAfterRender}
      onBeforeRender={onBeforeRender(v, normal)}
      geometry={g}
      receiveShadow
      castShadow
      material={wallMaterial}
    />
  );
};

const floorMaterial = new MeshPhongMaterial({
  // color: "#A87F57",
  // color: "#896D4C",
  map: tl.load(
    "materials/0032-parquet-decorated-texture-seamless-hr/32_parquet decorated texture-semaless_hr.jpg",
    rpt
  ),
  bumpMap: tl.load(
    "materials/0032-parquet-decorated-texture-seamless-hr/32_parquet decorated texture-semaless_hr_bump.jpg",
    rpt
  ),
  normalMap: tl.load(
    "materials/0032-parquet-decorated-texture-seamless-hr/normal.png",
    rpt
  ),
  bumpScale: 1000,
  normalScale: new Vector2(0, 1000),
});

const Ground = () => {
  return (
    <>
      <RectangularGrid
        x={{ cells: 1, size: 5.7 }}
        z={{ cells: 5, size: 1.2 }}
        color="#c5c5c5"
      />
      <Text
        position={[0, 0, -3.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={"#c5c5c5"}
        fontSize={0.22}
        textAlign={"left"}
        font={process.env.REACT_APP_FONT_URL}
        anchorX="center"
        anchorY="middle"
      >
        Building Technology: SWIFT
      </Text>

      <Text
        position={[3.25, 0, 2.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={"#c5c5c5"}
        fontSize={0.25}
        textAlign={"right"}
        font={process.env.REACT_APP_FONT_URL}
        anchorX="center"
        anchorY="middle"
      >
        1.2m
      </Text>

      <Text
        position={[0, 0, 3.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={"#c5c5c5"}
        fontSize={0.25}
        textAlign={"center"}
        font={process.env.REACT_APP_FONT_URL}
        anchorX="center"
        anchorY="middle"
      >
        5.7m
      </Text>
    </>
  );
};

const Floor = () => {
  const g = new BoxBufferGeometry(GRID_SIZE.x, 0.1, GRID_SIZE.z);
  g.translate(0, 0.05, 0);
  return (
    <mesh receiveShadow castShadow geometry={g} material={floorMaterial} />
  );
};

const Structure = () => {
  const floorHeight = 0.1;
  const wallHeight = GRID_SIZE.y - floorHeight;
  const wallWidth = 0.3;

  return (
    <>
      <rectAreaLight
        position={[0, wallHeight + floorHeight, 0]}
        intensity={0.7}
        width={GRID_SIZE.x - wallWidth * 2}
        height={GRID_SIZE.z - wallWidth * 2}
        // width={GRID_SIZE.x}
        // height={GRID_SIZE.z}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <pointLight position={[0, 0.4, 0.5]} intensity={0.4} />

      <group position={[0, 0.01, 0]}>
        <Floor />
        <group position={[0, wallHeight / 2 + 0.1, 0]}>
          <Wall
            bg={[wallWidth, wallHeight, GRID_SIZE.z]}
            t={[(GRID_SIZE.x - wallWidth) / 2, 0, 0]}
            n={[-1, 0, 0]}
          />
          <Wall
            bg={[wallWidth, wallHeight, GRID_SIZE.z]}
            t={[(-GRID_SIZE.x + wallWidth) / 2, 0, 0]}
            n={[1, 0, 0]}
          />

          <Wall
            bg={[GRID_SIZE.x, wallHeight, wallWidth]}
            t={[0, 0, (-GRID_SIZE.z + wallWidth) / 2]}
            n={[0, 0, 1]}
          />

          <Wall
            bg={[GRID_SIZE.x, wallHeight, wallWidth]}
            t={[0, 0, (GRID_SIZE.z - wallWidth) / 2]}
            n={[0, 0, -1]}
          />
        </group>
      </group>
    </>
  );
};

const RX = () => {
  // const [set] = useStore((store) => [store.set]);

  return (
    <InteractionsContainer>
      <Canvas
        orthographic
        pixelRatio={window.devicePixelRatio}
        gl={{
          logarithmicDepthBuffer: true,
          alpha: false,
          antialias: true,
        }}
        shadowMap={{
          type: PCFSoftShadowMap,
        }}
        onCreated={({ gl, camera, viewport }: any) => {
          gl.toneMapping = Uncharted2ToneMapping;
          gl.setClearColor(0xfcfbf5);
          // gl.setClearColor(0x1d537f);
          if (isOrthographicCamera(camera)) {
            camera.left = viewport.width / -2;
            camera.right = viewport.width / 2;
            camera.top = viewport.height / 2;
            camera.bottom = viewport.height / -2;
            camera.zoom = 100;
            camera.near = -1;
            camera.far = 1e5;
          }
          camera.position.set(10, 10, 10);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        }}
        // onPointerDownCapture={() =>
        //   set((draft) => {
        //     draft.selected.model = null;
        //   })
        // }
      >
        <ambientLight intensity={0.9} />

        <Structure />

        <Hanger />

        <Ground />

        <Controls />
        <Stats />
      </Canvas>
    </InteractionsContainer>
  );
};

export default RX;
