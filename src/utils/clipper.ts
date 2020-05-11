import ClipperLib from "clipper-fpoint";

type Point = [number, number];
type XYPoint = { X: number; Y: number };

const fromClipper = ({ X, Y }: XYPoint): Point => [X, Y];
const toClipper = ([X, Y]: Point): XYPoint => ({ X, Y });

const convertPointsForClipper = (points: Point[][]): XYPoint[][] =>
  points.map((pts) => pts.map((pt) => toClipper(pt)));

export const offset = (
  delta: number,
  {
    joinType = "jtMiter",
    endType = "etClosedPolygon",
    miterLimit = Infinity,
    roundPrecision = 0,
  } = {}
) => (points: Point[][]): Point[] => {
  const co = new ClipperLib.ClipperOffset(miterLimit, roundPrecision);
  const solution = new ClipperLib.Paths();
  co.AddPaths(
    convertPointsForClipper(points),
    ClipperLib.JoinType[joinType],
    ClipperLib.EndType[endType]
  );
  co.Execute(solution, delta);
  return solution.map((paths) => paths.map(fromClipper));
};

const clip = (clipType: string) => (
  points: Point[][],
  otherPoints: Point[][]
): Point[] => {
  const solution = new ClipperLib.Paths();
  const clipper = new ClipperLib.Clipper();

  clipper.AddPaths(
    convertPointsForClipper(points),
    ClipperLib.PolyType.ptSubject,
    true
  );

  clipper.AddPaths(
    convertPointsForClipper(otherPoints),
    ClipperLib.PolyType.ptClip,
    true
  );

  clipper.Execute(ClipperLib.ClipType[clipType], solution);

  return solution.map((paths) => paths.map(fromClipper));
};

// https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibcliptype
export const difference = clip("ctDifference");
export const intersection = clip("ctIntersection");
export const union = clip("ctUnion");
export const xor = clip("ctXor");
