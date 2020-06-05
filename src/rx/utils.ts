import { Face3, Geometry, Vector3 } from "three";

type Axis = "x" | "y" | "z";

interface Stuff {
  vertices: Vector3[];
  sharedAxis: Axis;
  faces?: Face3[];
}

const compare = (a: Vector3, b: Vector3): boolean => {
  return (
    Math.abs(a.x - b.x) < 0.0001 &&
    Math.abs(a.y - b.y) < 0.0001 &&
    Math.abs(a.z - b.z) < 0.0001
  );
};

export const coplanarStuff = (
  geometry: Geometry,
  face: Face3
  // [first, ...rest]: Vector3[]
): Stuff => {
  const { normal, a, b, c } = face;
  const [first, ...rest] = [
    geometry.vertices[a],
    geometry.vertices[b],
    geometry.vertices[c],
  ];

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

  const faces = geometry.faces.filter(({ normal: otherNormal }) => {
    const match = compare(normal, otherNormal);
    // for (let i = 0; i < vertices.length; i++) {
    //   if (compare(normal, otherNormal)) return (match = true);
    //   if (compare(vertices[b], vertices[i])) return (match = true);
    //   if (compare(vertices[c], vertices[i])) return (match = true);
    // }
    return match;
  });

  return {
    vertices,
    sharedAxis,
    faces,
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
