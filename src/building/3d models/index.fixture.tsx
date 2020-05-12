import React from "react";
import { DoubleSide, Shape } from "three";
import grid from "../../grid";
import crossSections, { ICrossSection } from "../crossSections";

const extrudeSettings = {
  depth: grid("m").z,
  steps: 2,
  bevelEnabled: false,
};

const makeShape = (points) => {
  const shape = new Shape();
  const [first, ...rest] = points.map(([x, y]) => [x, y]);
  shape.moveTo(first[0], first[1]);
  rest.map((point) => shape.lineTo(point[0], point[1]));
  return shape;
};

const s = (points, holes = []) => {
  const shape = makeShape(points);
  shape.holes = holes.map(makeShape);
  return shape;
};

const Model: React.FC<ICrossSection> = ({ points, width }) => {
  const [outline, ...holes] = points.map((pts) =>
    pts.map(([x, y]) => [x / 1000, y / 1000])
  );

  const shape = s(outline, holes);

  return (
    <mesh
      receiveShadow
      castShadow
      position={[-width / 2000, 0, -grid("m").z / 2]}
    >
      <meshStandardMaterial
        color="#bbbbbb"
        attach="material"
        side={DoubleSide}
      />
      <extrudeBufferGeometry
        args={[shape, extrudeSettings]}
        attach="geometry"
      />
    </mesh>
  );
};

export default Object.entries(crossSections).reduce(
  (acc, [type, section]: [string, ICrossSection]) => {
    acc[type] = <Model type={type} {...section} />;
    return acc;
  },
  {}
);
