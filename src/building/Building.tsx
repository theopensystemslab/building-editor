import React from "react";
import { useStore } from "../shared/store";
import { current } from "../utils/undoable";

const Building: React.FC<{ index: number }> = ({ index }) => {
  // get the first coordinate of the hangar to determine the building's position
  const { x, z } = useStore((store) => current(store.hangars)[index][0]);

  return (
    <group position={[1000, 500, z]}>
      <mesh>
        <boxBufferGeometry args={[1000, 1000, 1000]} attach="geometry" />
        <meshBasicMaterial color="red" attach="material" />
      </mesh>
    </group>
  );
};

export default Building;
