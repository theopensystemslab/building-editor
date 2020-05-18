import React from "react";
import { calculatePieces } from "../../building/Building";
import crossSections from "../../building/crossSections";
import { useStore } from "../../shared/store";
import { current } from "../../utils/undoable";
import DataSheet, { CellFormatters, defaultDataSheetProps } from "../DataSheet";
import { calculateEnergyFigures } from "./energyCalculator";

const data = require("./energyData.json");

const EnergyPanel: React.FC = () => {
  const hangar = useStore((store) => current(store.hangars)[0]);

  const pieces = calculatePieces(hangar);

  if (!pieces) return null;

  const floorArea = pieces.allTypes
    .map((k) => crossSections[k].floorArea)
    .reduce((a, b) => a + b, 0);

  const d = calculateEnergyFigures(data, floorArea);

  const headings = Object.keys(d[0])
    .filter(
      (s) => !s.startsWith("$") && s !== "Identifier" && s !== "SWC Constants"
    )
    .map((value) => ({ value, readOnly: true }));

  const grid = [
    headings,
    ...d
      .reduce((acc, curr) => {
        const o = [];
        headings.forEach(({ value }) => {
          const v = curr[value];
          if (typeof v === "string" && v.startsWith("=")) {
            o.push({
              value: curr.$val,
              expr: v,
              className: "equation",
              formatter: CellFormatters.CURRENCY,
            });
          } else {
            o.push({ value: v });
          }
        });

        acc.push(o);
        return acc;
      }, [])
      .slice(1),
  ];

  return (
    <>
      <h2>Energy Calculator</h2>
      {grid && (
        <DataSheet
          {...defaultDataSheetProps}
          data={grid}
          onCellsChanged={(changes) => {
            const newGrid = grid.map((row) => [...row]);
            changes.forEach(({ row, col, value }) => {
              grid[row][col] = { ...grid[row][col], value };
            });
            // setGrid(newGrid as any);
          }}
        />
      )}
    </>
  );
};

export default EnergyPanel;
