import React from "react";
import { useStore } from "../shared/store";
import Module from "./Module";

const Building: React.FC = () => {
  const {
    properties: {
      dimensions: { cellWidth, cellLength },
    },
    occupiedCells,
  } = useStore((store) => store.grid);

  return (
    <>
      {Object.entries(occupiedCells).map(
      {Object.entries(occupiedCells as State["grid"]["occupiedCells"]).map(
          <Module
            key={gridPosition}
            gridPosition={gridPosition}
            cellWidth={cellWidth}
            cellLength={cellLength}
            type={cellData.module}
          />
        )
      )}
    </>
  );
};

export default Building;
