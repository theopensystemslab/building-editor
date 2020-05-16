import React from "react";
import crossSections from "../../building/crossSections";
import { State, useStore } from "../../shared/store";
import chassisData from "./data/chassis.json";
import styles from "./infoPanel.module.css";

// TODO: pre-calculate and store all module costs etc in main config file

const ModuleSelector: React.FC<{ selected: string; position: string }> = ({
  selected,
  position,
}) => {
  const set = useStore((store) => store.set);
  const handleChange = (e) =>
    set((state: State) => {
      state.grid.occupiedCells[position].module = e.target.value;
    });

  return (
    <select value={selected} onChange={handleChange}>
      {Object.keys(crossSections)
        .sort()
        .map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
    </select>
  );
};

const InfoPanel: React.FC = () => {
  const occupiedCells = useStore(
    (state) => state.grid.occupiedCells
  ) as State["grid"]["occupiedCells"];

  return (
    <>
      <h2>Structure Information</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Bay #</th>
            <th>Module</th>
            <th>Cost (€)</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(occupiedCells).map(([position, data], i) => (
            <tr key={position}>
              <td>{i + 1}</td>
              <td>
                <ModuleSelector selected={data.module} position={position} />
              </td>
              <td className={styles.cost}>
                {chassisData?.find((x) =>
                  x["Module Name"].endsWith(data.module)
                )?.["Structure cost (Euro)"] || "?"}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="total">
            <th colSpan={2} className="right">
              Total
            </th>
            <th className={styles.cost}></th>
          </tr>
        </tfoot>
      </table>
    </>
  );
};

export default InfoPanel;
