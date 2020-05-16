import * as React from "react";
import ReactDataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";

export interface GridElement extends ReactDataSheet.Cell<GridElement, number> {
  value: number | null;
}

class MyReactDataSheet extends ReactDataSheet<GridElement, number> {}

//You can also strongly type all the Components or SFCs that you pass into ReactDataSheet.
let cellRenderer: ReactDataSheet.CellRenderer<GridElement, number> = (
  props
) => {
  const backgroundStyle =
    props.cell.value && props.cell.value < 0 ? { color: "red" } : undefined;
  return (
    <td
      style={backgroundStyle}
      onMouseDown={props.onMouseDown}
      onMouseOver={props.onMouseOver}
      onDoubleClick={props.onDoubleClick}
      className="cell"
    >
      {props.children}
    </td>
  );
};

const App: React.FC<{}> = () => {
  const [grid, setGrid] = React.useState([
    [{ value: 1 }, { value: -3 }],
    [{ value: -2 }],
  ]);

  return (
    <MyReactDataSheet
      data={grid}
      valueRenderer={(cell) => cell.value}
      onCellsChanged={(changes) => {
        const newGrid = grid.map((row) => [...row]);
        changes.forEach(({ row, col, value }) => {
          grid[row][col] = { ...grid[row][col], value };
        });
        setGrid(newGrid);
      }}
      cellRenderer={cellRenderer}
    />
  );
};

export default App;
