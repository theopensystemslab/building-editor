import React, { useMemo } from "react";
import { Color, Geometry, LineBasicMaterial, LinePieces, Vector3 } from "three";

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
    const geometry = new Geometry();

    const halfRowsTotal = (rowWidth * rows) / 2;
    const halfColumnsTotal = (columnHeight * columns) / 2;

    for (let i = 0; i <= rows; i += 1) {
      const position = rowWidth * i - halfRowsTotal;
      geometry.vertices.push(new Vector3(-halfColumnsTotal, position, 0));
      geometry.vertices.push(new Vector3(halfColumnsTotal, position, 0));
    }
    for (let i = 0; i <= columns; i += 1) {
      const position = columnHeight * i - halfColumnsTotal;
      geometry.vertices.push(new Vector3(position, -halfRowsTotal, 0));
      geometry.vertices.push(new Vector3(position, halfRowsTotal, 0));
    }
    return geometry;
  }, [rowWidth, columnHeight, rows, columns]);

  const material = useMemo(() => new LineBasicMaterial({ color }), [color]);

  return <lineSegments args={[gridGeometry, material, LinePieces]} />;
};

export default RectangularGrid;
