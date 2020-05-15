import { identity, times } from "ramda";
import React from "react";
import {
  DoubleSide,
  LineDashedMaterial,
  LineSegments,
  MeshStandardMaterial,
} from "three";
import { Hangar, hangarToCube } from "../shared/store";
import { fastBasicEqualityCheck, sample } from "../utils";
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

const Module: React.FC<any> = ({ type, position }) => {
  const { geometry, edgesGeometry } = crossSections[type];

  return (
    <group position={position}>
      <mesh receiveShadow castShadow material={material} geometry={geometry} />
      <lineSegments
        args={[edgesGeometry, linesMaterial]}
        ref={(e: LineSegments) => e?.computeLineDistances()}
      />
    </group>
  );
};

const NewBuilding: React.FC<{ hangar: Hangar }> = React.memo(({ hangar }) => {
  const { x, z, wx, wz } = hangarToCube(hangar);

  const rows = Math.round(wx / 5.7);
  const cols = Math.round(wz / 1.2);

  return (
    <group position={[x, 0.001, z]}>
      {times(identity, rows).map((_r) =>
        times(identity, cols).map((_z) => (
          <Module
            key={[_r, _z]}
            position={[_r * 5.7, 0, _z * 1.2]}
            type={sample(["A2_01", "B2_01", "C2_01"])}
          />
        ))
      )}
    </group>
  );
}, fastBasicEqualityCheck);

export default NewBuilding;
