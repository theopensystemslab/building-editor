import React from "react";
import crossSections from "../../building/crossSections";
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

const data = [
  [
    { value: "Bay #", readOnly: true },
    { value: "Module", readOnly: true },
    { value: "Floor Area m2", readOnly: true },
    { value: "Cost (€)", readOnly: true },
  ],
  [
    { value: "1", readOnly: true },
    {
      value: "B2_07",
      // dataEditor: SelectEditor,
      formatter: CellFormatters.MODULE,
    },
    { value: crossSections["B2_07"].floorArea, readOnly: true },
    { value: 100.0, readOnly: true, formatter: CellFormatters.CURRENCY },
  ],
  [
    { value: "2", readOnly: true },
    {
      value: "A2_07",
      // dataEditor: SelectEditor,
      formatter: CellFormatters.MODULE,
    },
    { value: crossSections["A2_07"].floorArea, readOnly: true },
    { value: 120.0, readOnly: true, formatter: CellFormatters.CURRENCY },
  ],
  [
    { value: "3", readOnly: true },
    {
      value: "A2_04",
      // dataEditor: SelectEditor,
      formatter: CellFormatters.MODULE,
    },
    { value: crossSections["A2_04"].floorArea, readOnly: true },
    { value: 420.22, readOnly: true, formatter: CellFormatters.CURRENCY },
  ],
  [
    {},
    {},
    { value: 1200, readOnly: true },
    { value: 24942.3, readOnly: true, formatter: CellFormatters.CURRENCY },
  ],
];

const InfoPanel: React.FC = () => {
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
