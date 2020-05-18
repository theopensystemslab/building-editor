import React from "react";
import { calculatePieces } from "../../building/Building";
import crossSections from "../../building/crossSections";
import { useStore } from "../../shared/store";
import { current } from "../../utils/undoable";
import DataSheet, { CellFormatters, defaultDataSheetProps } from "../DataSheet";

// TODO: pre-calculate and store all module costs etc in main config file

const SelectEditor = (props) => {
  const set = useStore((store) => store.set);

  return (
    <select
      autoFocus
      value={props.value}
      onChange={(e) => {
        set((state) => {
          state.picked[props.row - 2] = e.target.value;
          if (["A", "B", "C"].includes(e.target.value[0])) {
            state.letter = e.target.value[0];
            state.picked = state.picked.map((k) => {
              if (["A", "B", "C"].includes(k[0])) {
                return undefined;
              }
              return k;
            });
          }
        });
        props.onCommit();
      }}
    >
      {Object.keys(crossSections)
        // .filter((k) => k.endsWith(props.value.split("_")[1]))
        .map((k) => (
          <option key={k}>{k}</option>
        ))}
    </select>
  );
};

const InfoPanel: React.FC = () => {
  const hangar = useStore((store) => current(store.hangars)[0]);
  const letter = useStore((store) => store.letter);

  let totalCost = 0;
  let totalArea = 0;

  const pieces = calculatePieces(hangar);

  if (!pieces) return null;

  const data = [
    [
      { value: `(back)`, readOnly: true },
      {
        value: pieces.allTypes[0],
        formatter: CellFormatters.END_MODULE,
        readOnly: true,
      },
      { value: "", readOnly: true },
      { value: "?", readOnly: true },
    ],
    ...pieces.allTypes.map((k, i) => {
      totalArea += crossSections[k].floorArea;
      totalCost += crossSections[k].cost;

      return [
        { value: i + 1, readOnly: true },
        {
          value: k,
          // dataEditor: SelectEditor,
          formatter: CellFormatters.MODULE,
        },
        { value: crossSections[k].floorArea.toFixed(2), readOnly: true },
        {
          value: crossSections[k].cost,
          readOnly: true,
          formatter: CellFormatters.CURRENCY,
        },
      ];
    }),
    [
      { value: `(front)`, readOnly: true },
      {
        value: pieces.allTypes[pieces.allTypes.length - 1],
        formatter: CellFormatters.END_MODULE,
        readOnly: true,
      },
      { value: "", readOnly: true },
      { value: "?", readOnly: true },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: totalArea.toFixed(2), readOnly: true },
      { value: totalCost, readOnly: true, formatter: CellFormatters.CURRENCY },
    ],
  ];

  const all = [
    [
      { value: "Bay #", readOnly: true },
      { value: "Module", readOnly: true },
      { value: "Floor Area m2", readOnly: true },
      { value: "Cost (€)", readOnly: true },
    ],
    ...data,
  ];

  return (
    <>
      <h2>Structure Information</h2>
      <DataSheet
        {...defaultDataSheetProps}
        data={all as any}
        dataEditor={(props) => <SelectEditor {...props} />}
      />
    </>
  );
};

export default InfoPanel;
