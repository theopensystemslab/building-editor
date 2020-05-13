import React from "react";
import { State, useStore } from "../shared/store";
import Module from "./Module";

const Building: React.FC = () => {
  const {
    properties: {
      dimensions: { cellWidth, cellLength },
    },
    occupiedCells,
  } = useStore((store) => store.grid);

  return (
    <group position={[0, 0.01, 0]}>
      {Object.entries(occupiedCells as State["grid"]["occupiedCells"]).map(
        ([gridPosition, cellData]) => (
          <Module
            key={gridPosition}
            gridPosition={gridPosition}
            cellWidth={cellWidth}
            cellLength={cellLength}
            type={cellData.module}
          />
        )
      )}
    </group>
  );
};

export default Building;
