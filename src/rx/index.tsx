import anime from "animejs/lib/anime.es.js";
import { OrbitControls } from "drei";
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
  BoxGeometry,
  Geometry,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import create from "zustand";
import RectangularGrid from "../shared/RectangularGrid";
import { coplanarVertices } from "./utils";

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

const Box = () => {
  const { viewport, camera } = useThree();
  const set = useStore((store) => store.set);

  const plane = new Plane();

  return (
    <>
      {/* <planeHelper args={[plane, 10, 0xff0000]} /> */}
      <mesh
        // onPointerOver={(e) => {
        //   console.log("over");
        // }}
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

            const e$ = fromEvent(document, "mousemove").pipe(
              throttleTime(50),
              map((ev: MouseEvent) => {
                mouse.x = (ev.clientX / viewport.width) * 2 - 1;
                mouse.y = -(ev.clientY / viewport.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                raycaster.ray.intersectPlane(plane, intersects);
                startPos = startPos || intersects[axis];
                return intersects[axis] - startPos;
              }),
              takeUntil(fromEvent(document, "mouseup"))
            );

            const extrude = (delta) => {
              const toAddAgain = normal.clone().multiplyScalar(delta);
              allVertices.forEach((v, i) => {
                // quick and ugly check to ensure we don't end up with a 0-width/length/height polygon
                // if (
                //   !vertices.some(
                //     (x) =>
                //       JSON.stringify(x) === JSON.stringify(v.clone().add(toAdd))
                //   )
                // ) {
                v.copy(origVertices[i].clone().add(toAddAgain));
                // }
              });

              geometry.verticesNeedUpdate = true;
              geometry.computeBoundingSphere();
            };

            e$.pipe(takeLast(1)).subscribe((delta) => {
              const targets = {
                delta,
              };

              anime({
                targets,
                duration: 100,
                delta: Math.round(delta),
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
      >
        <boxGeometry
          attach="geometry"
          args={[1, 1, 1]}
          ref={(e) => (e as BoxGeometry)?.translate(0, 0.5, 0)}
        />
        <meshNormalMaterial attach="material" />
      </mesh>
    </>
  );
};

// const Info = () => {
//   const [action, selected] = useStore((store) => [
//     store.action,
//     store.selected,
//   ]);

//   return (
//     <div style={{ userSelect: "none", position: "fixed" }}>
//       <div>last action: {action}</div>
//       <div>tool: {selected.tool}</div>
//       <div>model: {selected.model}</div>
//     </div>
//   );
// };

const Controls = () => {
  const controlsEnabled = useStore((store) => store.controlsEnabled);
  return <OrbitControls enabled={controlsEnabled} />;
};

const RX = () => {
  // const [set] = useStore((store) => [store.set]);

  return (
    <InteractionsContainer>
      <Canvas
        orthographic
        onCreated={({ camera, viewport }: any) => {
          if (isOrthographicCamera(camera)) {
            camera.left = viewport.width / -2;
            camera.right = viewport.width / 2;
            camera.top = viewport.height / 2;
            camera.bottom = viewport.height / -2;
            camera.zoom = 100;
            // camera.zoom = 0.1;
            camera.near = -1e6;
            camera.far = 1e6;
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
        <Controls />
        <RectangularGrid
          x={{ cells: 7, size: 1 }}
          z={{ cells: 7, size: 1 }}
          color="black"
        />
        {/* <Model id="a" /> */}
        <Box />
      </Canvas>
    </InteractionsContainer>
  );
};

export default RX;
