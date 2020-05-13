import React from "react";
import {
  DoubleSide,
  LineDashedMaterial,
  LineSegments,
  MeshStandardMaterial,
} from "three";
import crossSections from "./crossSections";

// Placeholder mesh for the actual building modules

const material = new MeshStandardMaterial({
  color: "#dfdfdf",
  side: DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: 1,
});

const linesMaterial = new LineDashedMaterial({
  color: "#777777",
  linewidth: 0.5,
  scale: 10,
  dashSize: 1,
  gapSize: 1,
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
      <lineSegments
        args={[edgesGeometry, linesMaterial]}
        ref={(e: LineSegments) => e?.computeLineDistances()}
      />
    </group>
  );
};

export default Module;
