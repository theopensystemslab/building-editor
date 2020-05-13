import React from "react";
import { useStore } from "../shared/state";
import Module from "./Module";

const Building: React.FC = () => {
  const {
    properties: {
      dimensions: { cellWidth, cellHeight },
    },
    occupiedCells,
  } = useStore((store) => store.grid);

  return (
    <>
      {Object.keys(occupiedCells).map((gridPosition) => (
        <Module
          key={gridPosition}
          gridPosition={gridPosition}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
        />
      ))}
    </>
  );
};

export default Building;
