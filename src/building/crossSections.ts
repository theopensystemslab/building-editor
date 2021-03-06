import { bounds } from "@bentobots/vector2";
import { EdgesGeometry, ExtrudeBufferGeometry } from "three";
import grid from "../shared/grid";
import { pointsToThreeShape } from "../utils";
import { intersection, offset, Point, union } from "../utils/clipper";
import { pointsToSVGPath } from "../utils/svg";

const costs = {
  A1_05: 695.0,
  A1_04: 691.0,
  A1_03: 760.0,
  A1_02: 792.0,
  A1_01: 819.0,
  A2_05: 1059.0,
  A2_04: 885.0,
  A2_03: 1050.0,
  A2_02: 1077.0,
  A2_01: 1106.0,
};

const TOTAL_WIDTH = grid("mm").x;
const EAVES_HEIGHT = 6000;
const CEILING_HEIGHT = 3064;
const FRAME_WIDTH = 500;

export interface ICrossSection {
  type: string;
  width: number;
  height: number;
  svgPath: string;
  fill?: string;
  stroke?: string;
  points;
}

const shape = (roofPoint) => [
  [0, 0],
  [0, EAVES_HEIGHT],
  roofPoint,
  [TOTAL_WIDTH, EAVES_HEIGHT],
  [TOTAL_WIDTH, 0],
];

const shape2 = (x1, x2) => [
  [x1, 0],
  [x1, EAVES_HEIGHT],
  [x2, EAVES_HEIGHT],
  [x2, 0],
];

const shapes = ([x1, x2]) => ({
  A: shape([TOTAL_WIDTH / 2, 8850]),
  B: shape([TOTAL_WIDTH / 4, 8468]),
  C: shape([TOTAL_WIDTH / 2, 7645]),

  D: shape2(x1, x2),
  E: shape2(x1, x2),
});

const floorShape = (height = 0): Point[] => [
  [0, height],
  [0, height + 436],
  [TOTAL_WIDTH, height + 436],
  [TOTAL_WIDTH, height],
];

const variants = {
  A2: 7,
  B2: 7,
  C2: 7,
  // A2: 5,
  // B2: 7,
  // C2: 5,

  // D1: 1,
  // E1: 1,
  // D1: 4,
  // E1: 4,
  D1: 7,
  E1: 7,

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
      let shape = shapes(boxCoords[i])[type[0]];

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

      const numFloors = Number(type[1]);

      const floorArea = ((width - 450 * 2) * grid("mm").z * numFloors) / 1e6;

      acc[`${type}_0${i}`] = {
        x: boxCoords[i][0],
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
        floorArea,
        cost: costs[`${type}_0${i}`] || 0,
        svgPath: pointsToSVGPath(points),
        endSvgPath: pointsToSVGPath([points[0], []]),
      };
    }
    return acc;
  },
  {}
);

export default crossSections;
