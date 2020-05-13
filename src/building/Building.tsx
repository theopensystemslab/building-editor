import React, { useState } from "react";
import { State, useStore } from "../shared/store";
import Module from "./Module";

const Building: React.FC = () => {
  const [hovering, setHovering] = useState(undefined);

  const {
    properties: {
      dimensions: { cellWidth, cellLength },
    },
    occupiedCells,
  } = useStore((store) => store.grid);

  return (
    <>
      <group position={[0, 0.01, 0]}>
        {Object.entries(occupiedCells as State["grid"]["occupiedCells"]).map(
          ([gridPosition, cellData]) => (
            <Module
              key={gridPosition}
              gridPosition={gridPosition}
              cellWidth={cellWidth}
              cellLength={cellLength}
              type={cellData.module}
              setHovering={setHovering}
            />
          )
        )}
      </group>
      {hovering && (
        <arrowHelper args={[hovering[0], hovering[1], 2, 0x00ff00]} />
      )}
    </>
  );
};

export default Building;
