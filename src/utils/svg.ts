const stringify = ([first, ...rest]) => `M ${first} L ${rest} Z`;

export const pointsToSVGPath = ([outerPoints, ...innerPoints]) => {
  // innerPoints are the optional holes inside the path
  let path = stringify(outerPoints);
  (innerPoints || []).forEach((points) => (path += stringify(points)));
  return path;
};
