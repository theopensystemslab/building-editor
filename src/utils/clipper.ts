import ClipperLib from "clipper-fpoint";

const fromClipper = ({ X, Y }) => [X, Y];
const toClipper = ([X, Y]) => ({ X, Y });

export const offset = (
  delta,
  {
    joinType = "jtMiter",
    endType = "etClosedPolygon",
    miterLimit = Infinity,
    roundPrecision = 0,
  } = {}
) => (points) => {
  const co = new ClipperLib.ClipperOffset(miterLimit, roundPrecision);
  const solution = new ClipperLib.Paths();
  co.AddPaths(
    points.map((pts) => pts.map(toClipper)),
    ClipperLib.JoinType[joinType],
    ClipperLib.EndType[endType]
  );
  co.Execute(solution, delta);
  return solution.map((paths) => paths.map(fromClipper));
};

export const clip = (clipType) => (points, otherPoints) => {
  const solution = new ClipperLib.Paths();
  const clipper = new ClipperLib.Clipper();

  clipper.AddPaths(
    points.map((pts) => pts.map(toClipper)),
    ClipperLib.PolyType.ptSubject,
    true
  );

  clipper.AddPaths(
    otherPoints.map((pts) => pts.map(toClipper)),
    ClipperLib.PolyType.ptClip,
    true
  );

  clipper.Execute(ClipperLib.ClipType[clipType], solution);

  return solution.map((paths) => paths.map(fromClipper));
};

export const union = clip("ctUnion");
