import React from "react";
import { BoxGeometry, MeshBasicMaterial } from "three";

// Placeholder mesh for the actual building modules

const material = new MeshBasicMaterial({ color: "lightgreen" });

const box = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0);

interface IModule {
  gridPosition: string | [number, number];
  cellWidth: number;
  cellLength: number;
}

const Module: React.FC<IModule> = ({ gridPosition, cellWidth, cellLength }) => {
  const [x, z] =
    typeof gridPosition === "string"
      ? gridPosition.split(",").map(Number)
      : gridPosition;

  return (
    <mesh
      position={[x * cellWidth, 0, z * cellLength]}
      material={material}
      geometry={box}
    />
  );
};

export default Module;
