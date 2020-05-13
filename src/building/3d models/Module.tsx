import React from "react";
import { DoubleSide, MeshStandardMaterial } from "three";
import crossSections from "../crossSections";

const material = new MeshStandardMaterial({
  color: "#bbbbbb",
  side: DoubleSide,
});

const Module: React.FC<{ type: string }> = ({ type }) => {
  const { geometry, position } = crossSections[type];

  return (
    <mesh
      receiveShadow
      castShadow
      position={position}
      material={material}
      geometry={geometry}
    />
  );
};

export default Module;
