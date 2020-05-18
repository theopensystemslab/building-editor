import React from "react";
import { calculatePieces } from "../../building/Building";
import crossSections from "../../building/crossSections";
import { useStore } from "../../shared/store";
import { current } from "../../utils/undoable";
import DataSheet, { CellFormatters, defaultDataSheetProps } from "../DataSheet";

// TODO: pre-calculate and store all module costs etc in main config file

class SelectEditor extends React.PureComponent {
  // constructor(props) {
  //   super(props);
  //   // this.handleChange = this.handleChange.bind(this);
  //   // this.handleKeyDown = this.handleKeyDown.bind(this);
  //   // this.state = {};
  // }

  handleChange(opt) {
    // const { onCommit, onRevert } = this.props;
    // if (!opt) {
    //   return onRevert();
    // }
    // const { e } = this.state;
    // onCommit(opt.value, e);
    console.log("COMMITTED", opt.value);
  }

  handleKeyDown(e) {
    // record last key pressed so we can handle enter
    // if (e.which === ENTER_KEY || e.which === TAB_KEY) {
    //   e.persist();
    //   this.setState({ e });
    // } else {
    //   this.setState({ e: null });
    // }
  }

  render() {
    return (
      <select
      // autoFocus
      // value={this.props.value} onChange={this.handleChange}
      >
        {Object.keys(crossSections).map((k) => (
          <option key={k}>{k}</option>
        ))}
      </select>
    );
  }
}

const InfoPanel: React.FC = () => {
  const hangar = useStore((store) => current(store.hangars)[0]);

  let totalCost = 0;
  let totalArea = 0;

  const data = [
    [
      { value: "Bay #", readOnly: true },
      { value: "Module", readOnly: true },
      { value: "Floor Area m2", readOnly: true },
      { value: "Cost (€)", readOnly: true },
    ],
    ...calculatePieces(hangar).allTypes.map((k, i) => {
      totalArea += crossSections[k].floorArea;
      return [
        { value: i + 1, readOnly: true },
        {
          value: k,
          // dataEditor: SelectEditor,
          formatter: CellFormatters.MODULE,
        },
        { value: crossSections[k].floorArea.toFixed(2), readOnly: true },
        { value: 100.0, readOnly: true, formatter: CellFormatters.CURRENCY },
      ];
    }),
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: totalArea.toFixed(2), readOnly: true },
      { value: totalCost, readOnly: true, formatter: CellFormatters.CURRENCY },
    ],
  ];

  return (
    <>
      <h2>Structure Information</h2>
      <DataSheet
        {...defaultDataSheetProps}
        data={data as any}
        dataEditor={() => <SelectEditor />}
      />
    </>
  );
};

export default InfoPanel;
