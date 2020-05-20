import { Face3, Geometry, Vector3 } from "three";

type Axis = "x" | "y" | "z";

interface Stuff {
  vertices: Vector3[];
  sharedAxis: Axis;
  faces?: Face3[];
}

export const coplanarStuff = (
  geometry: Geometry,
  [first, ...rest]: Vector3[]
): Stuff => {
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
  )[0] as Axis;

  const vertices = Array.from(
    new Set(
      geometry.vertices.filter((v) => v[sharedAxis] === first[sharedAxis])
    )
  );

  return {
    vertices,
    sharedAxis,
    // faces: geometry.faces.filter(({ a, b, c }) =>
    //   vertices
    //     .map((v) => JSON.stringify(v))
    //     .some((v) => {
    //       return (
    //         v === JSON.stringify(a) ||
    //         v === JSON.stringify(b) ||
    //         v === JSON.stringify(c)
    //       );
    //     })
    // ),
  };
};

// const quickCompare = (a, b) => JSON.stringify(a) === JSON.stringify(b);
