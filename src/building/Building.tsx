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
        ([gridPosition, data]: [string, any]) => (
          <Module
            key={gridPosition}
            gridPosition={gridPosition}
            cellWidth={cellWidth}
            cellLength={cellLength}
            type={data.module}
          />
        )
      )}
    </>
  );
};

export default Building;
