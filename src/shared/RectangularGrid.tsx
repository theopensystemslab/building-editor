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
  cellWidth?: number;
  cellLength?: number;
  numXCells?: number;
  numZCells?: number;
  color?: number | string | Color;
};

const RectangularGrid: React.FC<IReactangularGrid> = ({
  cellWidth = 10,
  cellLength = 10,
  numXCells = 10,
  numZCells = 10,
  color = "red",
}) => {
  const gridGeometry = useMemo(() => {
    const geometry = new BufferGeometry();

    let vertices = [];

    const halfnumXCellsTotal = (cellWidth * numXCells) / 2;
    const halfnumZCellsTotal = (cellLength * numZCells) / 2;

    for (let i = 0; i <= numXCells; i += 1) {
      const position = cellWidth * i - halfnumXCellsTotal;
      vertices.push([position, 0, -halfnumZCellsTotal]);
      vertices.push([position, 0, halfnumZCellsTotal]);
    }

    for (let i = 0; i <= numZCells; i += 1) {
      const position = cellLength * i - halfnumZCellsTotal;
      vertices.push([-halfnumXCellsTotal, 0, position]);
      vertices.push([halfnumXCellsTotal, 0, position]);
    }

    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(flatten(vertices)), 3)
    );

    return geometry;
  }, [cellWidth, cellLength, numXCells, numZCells]);

  const material = useMemo(() => new LineBasicMaterial({ color }), [color]);

  return <lineSegments args={[gridGeometry, material, LinePieces]} />;
};

export default RectangularGrid;
