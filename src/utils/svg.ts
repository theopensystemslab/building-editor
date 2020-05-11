import { Point } from "./clipper";

const stringify = ([first, ...rest]: Point[]) => `M ${first} L ${rest} Z`;

export const pointsToSVGPath = ([outerPoints, ...innerPoints]: Point[][]) => {
  // innerPoints are the optional holes inside the path
  let path = stringify(outerPoints);
  (innerPoints || []).forEach((points) => (path += stringify(points)));
  return path;
};
