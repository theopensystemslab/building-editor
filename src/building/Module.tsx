import React from "react";
import { DoubleSide, LineBasicMaterial, MeshStandardMaterial } from "three";
import crossSections from "./crossSections";

// Placeholder mesh for the actual building modules

const material = new MeshStandardMaterial({
  color: "#67DD52",
  side: DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: 1,
});

const linesMaterial = new LineBasicMaterial({
  color: "#39803C",
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
  const { geometry, edgesGeometry, position } = crossSections[type];

  const [x, z] =
    typeof gridPosition === "string"
      ? gridPosition.split(",").map(Number)
      : gridPosition;

  return (
    <group
      position={[
        x * cellWidth + position[0],
        0 + position[1],
        z * cellLength + position[2],
      ]}
    >
      <mesh receiveShadow castShadow material={material} geometry={geometry} />
      <lineSegments args={[edgesGeometry, linesMaterial]} />
    </group>
  );
};

export default Module;
