import { Geometry, Vector3 } from "three";

export const coplanarVertices = (
  geometry: Geometry,
  [first, ...rest]: Vector3[]
): [Vector3[], string] => {
  const sharedAxis = Object.keys(
    rest.reduce(
      (acc, curr) => {
        Object.keys(curr).forEach((k) => {
          if (curr[k] !== acc[k]) delete acc[k];
        });
        return acc;
      },
      { ...first }
    )
  )[0];
  return [
    Array.from(
      new Set(
        geometry.vertices.filter((v) => v[sharedAxis] === first[sharedAxis])
      )
    ),
    sharedAxis,
  ];
};

// const quickCompare = (a, b) => JSON.stringify(a) === JSON.stringify(b);
