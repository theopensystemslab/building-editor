import { flatten } from "ramda";
import React, { useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LinePieces,
} from "three";

type IReactangularGrid = {
  rowWidth?: number;
  columnHeight?: number;
  rows?: number;
  columns?: number;
  color?: number | string | Color;
};

const RectangularGrid: React.FC<IReactangularGrid> = ({
  rowWidth = 10,
  columnHeight = 10,
  rows = 10,
  columns = 10,
  color = "red",
}) => {
  const gridGeometry = useMemo(() => {
    const geometry = new BufferGeometry();

    let vertices = [];

    const halfRowsTotal = (rowWidth * rows) / 2;
    const halfColumnsTotal = (columnHeight * columns) / 2;

    for (let i = 0; i <= rows; i += 1) {
      const position = rowWidth * i - halfRowsTotal;
      vertices.push([-halfColumnsTotal, position, 0]);
      vertices.push([halfColumnsTotal, position, 0]);
    }

    for (let i = 0; i <= columns; i += 1) {
      const position = columnHeight * i - halfColumnsTotal;
      vertices.push([position, -halfRowsTotal, 0]);
      vertices.push([position, halfRowsTotal, 0]);
    }

    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(flatten(vertices)), 3)
    );

    return geometry;
  }, [rowWidth, columnHeight, rows, columns]);

  const material = useMemo(() => new LineBasicMaterial({ color }), [color]);

  return <lineSegments args={[gridGeometry, material, LinePieces]} />;
};

export default RectangularGrid;
