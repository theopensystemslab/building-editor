import { flatten } from "ramda";
import React, { useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineDashedMaterial,
  LinePieces,
  LineSegments,
} from "three";

interface Axis {
  cells: number;
  size: number;
  subDivisions?: number[];
}

interface IReactangularGrid {
  x: Axis;
  z: Axis;
  color?: number | string | Color;
  dashed?: boolean;
}

const RectangularGrid: React.FC<IReactangularGrid> = ({
  x,
  z,
  color = "red",
  dashed = false,
}) => {
  const gridGeometry = useMemo(() => {
    const geometry = new BufferGeometry();

    const vertices = [];

    const halfnumXCellsTotal = (x.size * x.cells) / 2;
    const halfnumZCellsTotal = (z.size * z.cells) / 2;

    for (let i = 0; i <= x.cells; i += 1) {
      const position = x.size * i - halfnumXCellsTotal;
      vertices.push([position, 0, -halfnumZCellsTotal]);
      vertices.push([position, 0, halfnumZCellsTotal]);

      if (x.subDivisions && i < x.cells) {
        for (let j = 0; j < x.subDivisions.length; j += 1) {
          const position2 = position + x.subDivisions[j];
          vertices.push([position2, 0, -halfnumZCellsTotal]);
          vertices.push([position2, 0, halfnumZCellsTotal]);
        }
      }
    }

    for (let i = 0; i <= z.cells; i += 1) {
      const position = z.size * i - halfnumZCellsTotal;
      vertices.push([-halfnumXCellsTotal, 0, position]);
      vertices.push([halfnumXCellsTotal, 0, position]);
    }

    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(flatten(vertices)), 3)
    );

    return geometry;
  }, [x, z]);

  const material = useMemo(() => {
    if (dashed) {
      return new LineDashedMaterial({
        color,
        linewidth: 0.5,
        scale: 10,
        dashSize: 1,
        gapSize: 1,
      });
    }
    return new LineBasicMaterial({ color });
  }, [color, dashed]);

  return (
    <lineSegments
      args={[gridGeometry, material, LinePieces]}
      ref={(e: LineSegments) => dashed && e?.computeLineDistances()}
    />
  );
};

export default RectangularGrid;
