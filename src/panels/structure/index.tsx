import React from "react";
import crossSections from "../../building/crossSections";
import { State, useStore } from "../../shared/store";
import DataSheet, { CellFormatters, defaultDataSheetProps } from "../DataSheet";

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

var TAB_KEY = 9;
var ENTER_KEY = 13;

class SelectEditor extends React.PureComponent {
  constructor(props) {
    super(props);
    // this.handleChange = this.handleChange.bind(this);
    // this.handleKeyDown = this.handleKeyDown.bind(this);
    // this.state = {};
  }

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
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>
    );
  }
}

const data = [
  [
    { value: "Bay #", readOnly: true },
    { value: "Module", readOnly: true },
    { value: "Internal Area m2", readOnly: true },
    { value: "Cost (€)", readOnly: true },
  ],
  [
    { value: "1", readOnly: true },
    {
      value: "B2_07",
      // dataEditor: SelectEditor,
      formatter: CellFormatters.MODULE,
    },
    { value: 100.0, readOnly: true },
    { value: 100.0, readOnly: true, formatter: CellFormatters.CURRENCY },
  ],
  [
    { value: "2", readOnly: true },
    {
      value: "A2_07",
      // dataEditor: SelectEditor,
      formatter: CellFormatters.MODULE,
    },
    { value: 100.0, readOnly: true },
    { value: 120.0, readOnly: true, formatter: CellFormatters.CURRENCY },
  ],
  [
    { value: "3", readOnly: true },
    {
      value: "A2_04",
      // dataEditor: SelectEditor,
      formatter: CellFormatters.MODULE,
    },
    { value: 100.0, readOnly: true },
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
  const occupiedCells = useStore(
    (state) => state.grid.occupiedCells
  ) as State["grid"]["occupiedCells"];

  return (
    <>
      <h2>Structure Information</h2>
      <DataSheet
        {...defaultDataSheetProps}
        data={data as any}
        dataEditor={(props) => <SelectEditor />}
      />
    </>
  );
};

export default InfoPanel;
