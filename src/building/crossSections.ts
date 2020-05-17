import { bounds } from "@bentobots/vector2";
import { EdgesGeometry, ExtrudeBufferGeometry } from "three";
import grid from "../shared/grid";
import { pointsToThreeShape } from "../utils";
import { intersection, offset, Point, union } from "../utils/clipper";
import { pointsToSVGPath } from "../utils/svg";

const TOTAL_WIDTH = grid("mm").x;
const EAVES_HEIGHT = 6000;
const CEILING_HEIGHT = 3064;
const FRAME_WIDTH = 500;

export interface ICrossSection {
  type: string;
  width: number;
  height: number;
  svgPath: string;
  points;
}

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
  // roof shape doesn't matter for D & E
  D: shape([TOTAL_WIDTH / 2, 7645]),
  E: shape([TOTAL_WIDTH / 2, 7645]),
};

const floorShape = (height = 0): Point[] => [
  [0, height],
  [0, height + 436],
  [TOTAL_WIDTH, height + 436],
  [TOTAL_WIDTH, height],
];

const variants = {
  A2: 5,
  B2: 7,
  C2: 5,
  D1: 1,
  E1: 1,
  // D1: 4,
  // E1: 4,
  // A1: 5,
  // B1: 7,
  // C1: 5,
};

const extrudeSettings = {
  depth: grid("m").z,
  steps: 2,
  bevelEnabled: false,
};

const boxCoords = {
  4: [0, 2100],
  3: [0, 3300],
  2: [0, 4500],
  1: [0, 5700],
  5: [1200, 4500],
  6: [1200, 5700],
  7: [2400, 5700],
};

const crossSections = Object.entries(variants).reduce(
  (acc, [type, numVariants]) => {
    for (let i = 1; i <= numVariants; i++) {
      let shape = shapes[type[0]];

      let h = 9000;
      if (type.startsWith("D")) h = 4600;
      else if (type.startsWith("E")) h = 3600;

      const box: Point[] = [
        [boxCoords[i][0], 0],
        [boxCoords[i][0], h],
        [boxCoords[i][1], h],
        [boxCoords[i][1], 0],
      ];

      if (h === 9000) shape = intersection([shape], [box])[0];

      const holes = offset(-FRAME_WIDTH)([shape]);

      const points = intersection(
        union([shape, ...holes], [floorShape(CEILING_HEIGHT)]),
        [box]
      );

      const { minX, maxX, minY, maxY } = bounds(shape);
      const width = Math.abs(maxX - minX);
      const height = Math.abs(maxY - minY);

      const [gOutline, ...gHoles] = points.map((pts) =>
        pts.map(([x, y]) => [x / 1000, y / 1000])
      );

      const gShape = pointsToThreeShape(gOutline, gHoles);
      const position = [-width / 2000, 0, -grid("m").z / 2];

      const geometry = new ExtrudeBufferGeometry(gShape, extrudeSettings);
      const edgesGeometry = new EdgesGeometry(geometry);

      const endGeometry = new ExtrudeBufferGeometry(
        pointsToThreeShape(gOutline),
        {
          ...extrudeSettings,
          depth: 0.189,
        }
      );
      const endEdgesGeometry = new EdgesGeometry(endGeometry);

      acc[`${type}_0${i}`] = {
        clipWidth: boxCoords[i][1] - boxCoords[i][0],
        shape,
        holes,
        points,
        width,
        height,
        geometry,
        edgesGeometry,
        endGeometry,
        endEdgesGeometry,
        position,
        svgPath: pointsToSVGPath(points),
      };
    }
    return acc;
  },
  {}
);

export default crossSections;
