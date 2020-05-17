import { flatten, identity, times } from "ramda";
import React, { useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  LineBasicMaterial,
  LineDashedMaterial,
  LinePieces,
  LineSegments,
  MeshStandardMaterial,
} from "three";
import { Hangar, hangarToCube } from "../shared/store";
import { fastBasicEqualityCheck, sample } from "../utils";
import { clippingPlanes } from "./ClipPlane";
import crossSections from "./crossSections";

// Placeholder mesh for the actual building modules

const material = new MeshStandardMaterial({
  color: "#dfdfdf",
  side: DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  clippingPlanes,
  clipShadows: true,
});

const linesMaterial = new LineDashedMaterial({
  color: "#666",
  linewidth: 0.5,
  scale: 10,
  dashSize: 1,
  gapSize: 1,
  clippingPlanes,
  clipShadows: true,
});

const hangarLineMaterial = new LineBasicMaterial({
  color: "#53ADF9",
  linewidth: 2,
});

const Module: React.FC<any> = ({ type, position, end = false }) => {
  const {
    geometry,
    edgesGeometry,
    endEdgesGeometry,
    endGeometry,
    width: widthMM,
    height: heightMM,
  } = crossSections[type];

  const geo = useMemo(() => {
    const width = widthMM / 1000;
    const height = heightMM / 1000;
    const vertices = [];
    vertices.push([0, 0, 0]);
    vertices.push([0, height, 0]);
    vertices.push([0, 0, 1.2]);
    vertices.push([0, height, 1.2]);

    vertices.push([width, 0, 0]);
    vertices.push([width, height, 0]);
    vertices.push([width, 0, 1.2]);
    vertices.push([width, height, 1.2]);

    vertices.push([0, height, 0]);
    vertices.push([width, height, 0]);

    vertices.push([0, height, 1.2]);
    vertices.push([width, height, 1.2]);

    vertices.push([0, height, 0]);
    vertices.push([0, height, 1.2]);

    vertices.push([width, height, 0]);
    vertices.push([width, height, 1.2]);

    const g = new BufferGeometry();
    g.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(flatten(vertices)), 3)
    );
    return g;
  }, [geometry]);

  return (
    <group position={position}>
      <lineSegments
        args={[geo, hangarLineMaterial, LinePieces]}
        // ref={(e: LineSegments) => dashed && e?.computeLineDistances()}
      />
      <mesh
        receiveShadow
        castShadow
        material={material}
        geometry={end ? endGeometry : geometry}
      />
      <lineSegments
        args={[end ? endEdgesGeometry : edgesGeometry, linesMaterial]}
        ref={(e: LineSegments) => e?.computeLineDistances()}
      />
    </group>
  );
};

const NewBuilding: React.FC<{ hangar: Hangar }> = React.memo(({ hangar }) => {
  const { x, z, wx, wz } = hangarToCube(hangar);

  const rows = Math.round(wx / 5.7);
  const cols = Math.round(wz / 1.2);

  const type = sample(["A2", "B2", "C2"]);

  // console.log(Object.entries(crossSections));

  // console.log(Math.round(wx * 1000));

  const types = Object.entries(crossSections)
    .filter(([k, v]: [string, any]) => {
      // console.log({
      //   c: v.clipWidth,
      //   r: Math.round(wx * 1000),
      // });

      return (
        // k.startsWith(type) &&
        (k.startsWith(type) || k.startsWith("D1") || k.startsWith("E1")) &&
        v.clipWidth === Math.round(wx * 1000)
      );
    })
    .map(([k]) => k);

  if (types.length === 0) return null;

  const allTypes = times(() => sample(types), cols * rows);
  let count = -1;

  return (
    <group position={[x, 0.001, z]}>
      {times(identity, rows).map((_r) => {
        return (
          <>
            {/* <Module
              key={`${_r}front`}
              position={[_r * 5.7, 0, -0.189]}
              type={allTypes[0]}
              end
            /> */}
            {times(identity, cols).map((_z) => {
              count += 1;
              return (
                <Module
                  key={[_r, _z]}
                  position={[_r * 5.7, 0, _z * 1.2]}
                  type={allTypes[count]}
                />
              );
            })}
            {/* <Module
              key={`${_r}back`}
              position={[_r * 5.7, 0, cols * 1.2]}
              type={allTypes[allTypes.length - 1]}
              end
            /> */}
          </>
        );
      })}
    </group>
  );
}, fastBasicEqualityCheck);

export default NewBuilding;
