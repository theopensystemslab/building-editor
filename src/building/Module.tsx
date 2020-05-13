import React from "react";
import { DoubleSide, MeshStandardMaterial } from "three";
import crossSections from "./crossSections";

// Placeholder mesh for the actual building modules

const material = new MeshStandardMaterial({
  color: "mediumspringgreen",
  side: DoubleSide,
});

interface IModule {
  gridPosition: string | [number, number];
  cellWidth: number;
  cellLength: number;
  type: string;
}

const Module: React.FC<IModule> = ({
  type,
  gridPosition,
  cellWidth,
  cellLength,
}) => {
  const { geometry, position } = crossSections[type];

  const [x, z] =
    typeof gridPosition === "string"
      ? gridPosition.split(",").map(Number)
      : gridPosition;

  return (
    <mesh
      receiveShadow
      castShadow
      position={[
        x * cellWidth + position[0],
        0 + position[1],
        z * cellLength + position[2],
      ]}
      material={material}
      geometry={geometry}
    />
  );
};

export default Module;
