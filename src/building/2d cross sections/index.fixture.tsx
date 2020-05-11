import { bounds } from "@bentobots/vector2";
import React from "react";
import grid from "../../grid";
import { offset, Point, union } from "../../utils/clipper";
import { pointsToSVGPath } from "../../utils/svg";

const TOTAL_WIDTH = grid("mm").x;
const EAVES_HEIGHT = 6000;
const CEILING_HEIGHT = 3500;
const FRAME_WIDTH = 500;

const shape = (roofPoint) => [
  [0, 0],
  [0, EAVES_HEIGHT],
  roofPoint,
  [TOTAL_WIDTH, EAVES_HEIGHT],
  [TOTAL_WIDTH, 0],
];

const shapes = {
  A: shape([TOTAL_WIDTH / 2, 8850]),
  B: shape([TOTAL_WIDTH / 4, 8468]),
  C: shape([TOTAL_WIDTH / 2, 7645]),
};

const floorShape = (height = 0): Point[] => [
  [0, height],
  [0, height + 436],
  [TOTAL_WIDTH, height + 436],
  [TOTAL_WIDTH, height],
];

function CrossSection({ type, variant }) {
  const shape = shapes[type[0]];
  const holes = offset(-FRAME_WIDTH)([shape]);

  const points = union([shape, ...holes], [floorShape(CEILING_HEIGHT)]);

  const { minX, maxX, minY, maxY } = bounds(shape);

  const width = Math.abs(maxX - minX);
  const height = Math.abs(maxY - minY);

  return (
    <svg
      viewBox={`-1 -1 ${width + 2} ${height + 2}`}
      style={{
        maxHeight: 400,
        maxWidth: "100%",
      }}
      transform={`scale(1,-1)`}
    >
      <path
        d={pointsToSVGPath(points)}
        stroke="black"
        vectorEffect="non-scaling-stroke"
        fill="yellow"
      />
    </svg>
  );
}

const variants = {
  A2: 1,
  B2: 1,
  C2: 1,
  // A2: 5,
  // B2: 7,
  // C2: 5,
  // D1: 4,
  // E1: 4,
  // A1: 5,
  // B1: 7,
  // C1: 5,
};

export default Object.entries(variants).reduce((acc, [type, numVariants]) => {
  for (let i = 1; i <= numVariants; i++) {
    acc[`${type}_0${i}`] = <CrossSection type={type} variant={i} />;
  }
  return acc;
}, {});
