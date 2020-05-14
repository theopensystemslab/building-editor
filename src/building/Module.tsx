import React, { useMemo, useState } from "react";
import {
  BoxGeometry,
  DoubleSide,
  EdgesGeometry,
  Geometry,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import csg from "../utils/three-csg";
import crossSections from "./crossSections";

// Placeholder mesh for the actual building modules

const highlight = new MeshStandardMaterial({
  color: "green",
});

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
  setHovering?;
}

const Module: React.FC<IModule> = ({
  type,
  gridPosition,
  cellWidth,
  cellLength,
  setHovering,
}) => {
  const { geometry, edgesGeometry, position } = crossSections[type];

  const [x, z] =
    typeof gridPosition === "string"
      ? gridPosition.split(",").map(Number)
      : gridPosition;

  const pointerEvents = process.env.REACT_APP_DEBUG && {
    onPointerOut: () => {
      setHovering(undefined);
    },
    onPointerMove: (e) => {
      e.stopPropagation();
      setHovering([e.face.normal, e.point]);
    },
  };

  const [obj, set] = useState();

  const url = `models/staircase.stl`;

  useMemo(() => {
    new STLLoader().load(url, set as any);
  }, [url]);

  if (!obj) return null;

  const thing = new Mesh(new Geometry().fromBufferGeometry(geometry), material);

  const b = new BoxGeometry(3, 1, 1);
  // b.translate(0.6, 3.7, 4);
  // b.translate(3.7, 4, 0.6);
  const box = new Mesh(b, new MeshBasicMaterial({ color: "red" }));
  box.position.set(3.7, 4, 0.6);
  box.quaternion.set(0, 0, 0, 1).normalize();
  // box.position.z = 0.6;
  // box.position.x = 3.7;
  // box.position.y = 4;

  const subtractmesh = csg.subtract(thing, box, material); // removes parts of box that don't overlap with sphere
  // subtractmesh.position.set(3.7, 4, 0.6);
  // subtractmesh.quaternion.set(0, 0, 0, 1).normalize();

  const g2 = new Geometry().fromBufferGeometry(obj);

  const staircase = new Mesh(g2, material);
  staircase.position.set(1.75, 0.5, 0);

  const unionmesh = csg.union(subtractmesh, staircase, material);
  unionmesh.castShadow = true;
  unionmesh.receiveShadow = true;
  unionmesh.position.set(0, 0, 0);

  const edgesGeometry2 = new EdgesGeometry(unionmesh.geometry);
  const lineSegments = new LineSegments(g2, linesMaterial);
  // edgesGeometry2.translate(3.7, 4, 0.6);

  console.log({
    unionmesh,
    lineSegments,
  });

  return (
    <group
      position={[
        x * cellWidth + position[0],
        0 + position[1],
        // 4.3,
        z * cellLength + position[2],
      ]}
    >
      {/* <mesh
        receiveShadow
        castShadow
        material={material}
        geometry={geometry}
        {...pointerEvents}
      /> */}
      {/* <primitive object={box} /> */}
      <primitive object={subtractmesh} />
      <Thing geometry={staircase.geometry} />
      {/* <primitive object={lineSegments} /> */}
      <lineSegments
        args={[edgesGeometry2, linesMaterial]}
        ref={(e: LineSegments) => e?.computeLineDistances()}
      />
      )}
    </group>
  );
};

const Thing = ({ geometry }) => {
  const [clicked, setClicked] = useState(false);
  return (
    <mesh
      geometry={geometry}
      material={clicked ? highlight : material}
      position={[1.75, 0.5, 0]}
      onPointerUp={(e) => {
        e.stopPropagation();
        setClicked(!clicked);
      }}
    />
  );
};

export default Module;
