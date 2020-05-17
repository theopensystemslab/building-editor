import React, { useEffect, useState } from "react";
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

// const Interactions = {
//   NONE: "NONE",
//   PANNING: "PANNING",
//   ZOOMING: "ZOOMING",
//   ORBITING: "ORBITING",
//   EXTRUDING: "EXTRUDING",
//   MOVING: "MOVING",
//   CLONING: "CLONING",
// };

function Box(props) {
  return (
    <mesh {...props}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshNormalMaterial attach="material" />
    </mesh>
  );
}

const RX = () => {
  const [action, setAction] = useState("");

  useEffect(() => {
    const pointerDown$ = fromEvent(document, "pointerdown");
    const pointerUp$ = fromEvent(document, "pointerup");

    const tap$ = pointerDown$.pipe(
      switchMap(() => pointerUp$.pipe(timeoutWith(200, pointerDown$))),
      map(() => "tap")
    );

    const hold$ = pointerDown$.pipe(
      flatMap(() => timer(500).pipe(takeUntil(pointerUp$))),
      map(() => "hold")
    );

    const doubleTap$ = tap$.pipe(
      buffer(tap$.pipe(debounceTime(300))),
      filter(({ length }) => length === 2),
      map(() => "doubletap")
    );

    const merged$ = merge(tap$, hold$, doubleTap$);

    const clearIfNothingHappensFor3s = merged$
      .pipe(flatMap(() => timer(3000).pipe(takeUntil(merged$))))
      .subscribe(() => setAction(""));

    const actions = merged$.subscribe((val) => {
      setAction(val);
    });

    return () => {
      actions.unsubscribe();
      clearIfNothingHappensFor3s.unsubscribe();
    };
  });

  return (
    <>
      <div style={{ userSelect: "none" }}>last action: {action}</div>
      <Canvas
        camera={{
          position: [5, 5, 5],
          fov: 70,
        }}
      >
        <Box />
      </Canvas>
    </>
  );
};

export default RX;
