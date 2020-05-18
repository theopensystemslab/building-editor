import produce from "immer";
import React, { useEffect, useRef } from "react";
import { Canvas } from "react-three-fiber";
import { fromEvent, merge, timer } from "rxjs";
import {
  buffer,
  debounceTime,
  filter,
  flatMap,
  map,
  switchMap,
  takeUntil,
  timeoutWith,
} from "rxjs/operators";
import create from "zustand";

enum Actions {
  TAP,
  DOUBLE_TAP,
  TAP_AND_HOLD,
}

// enum Tool {
//   PAN,
//   ZOOM,
//   ORBIT,
//   EXTRUDE,
//   MOVE,
//   CLONE,
// }

const quickCompare = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const [useStore] = create((set) => ({
  action: null,
  selected: {
    tool: null,
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
    <div ref={ref} style={{ height: "100%" }}>
      {children}
    </div>
  );
};

const Model = React.memo(({ id, position, setActive, active = false }: any) => {
  return (
    <mesh position={position} onPointerDown={(e) => setActive(id)}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshBasicMaterial attach="material" color={active ? "red" : "orange"} />
    </mesh>
  );
}, quickCompare);

const Info = () => {
  const [action, selected] = useStore((store) => [
    store.action,
    store.selected,
  ]);

  return (
    <div style={{ userSelect: "none", position: "fixed" }}>
      <div>last action: {action}</div>
      <div>tool: {selected.tool}</div>
      <div>model: {selected.model}</div>
    </div>
  );
};

const RX = () => {
  const [selectedModel, set] = useStore((store) => [
    store.selected.model,
    store.set,
  ]);

  return (
    <InteractionsContainer>
      <Info />

      <Canvas
        onPointerDownCapture={() =>
          set((draft) => {
            draft.selected.model = null;
          })
        }
        camera={{
          position: [5, 5, 5],
          fov: 70,
        }}
      >
        <Model
          id="a"
          position={[-2, 0, 0]}
          setActive={(id) =>
            set((draft) => {
              draft.selected.model = id;
            })
          }
          active={selectedModel === "a"}
        />
        <Model
          id="b"
          position={[2, 0, 0]}
          setActive={(id) =>
            set((draft) => {
              draft.selected.model = id;
            })
          }
          active={selectedModel === "b"}
        />
      </Canvas>
    </InteractionsContainer>
  );
};

export default RX;
