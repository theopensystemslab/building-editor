import CircularProgress from "@material-ui/core/CircularProgress";
import classnames from "classnames";
import { identity } from "ramda";
import React, { useState } from "react";
import ReactDataSheet from "react-datasheet";
import GoogleLogin from "react-google-login";
import { useStore } from "../../shared/store";
import { calculateEnergyFigures } from "./energyCalculator";

interface GridElement extends ReactDataSheet.Cell<GridElement, number> {
  value?: number | string;
  expr?: string;
  className?: string;
  readOnly?: boolean;
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
      className={classnames("cell", props.className)}
    >
      {props.children}
    </td>
  );
};

const EnergyPanel: React.FC = () => {
  const [user, set] = useStore((store) => [store.user, store.set]);
  const [data, setData] = useState(require("./energyData.json"));
  const [floorArea, setFloorArea] = useState(80);

  const [grid, setGrid] = React.useState();
  //   [
  //   [
  //     { value: "Name", readOnly: true },
  //     { value: "Identifier", readOnly: true },
  //     { value: "SWC Constants", readOnly: true },
  //     { value: "Variable calcs", readOnly: true },
  //     { value: "Units", readOnly: true },
  //   ],
  //   [{ value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }],
  //   [{ value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }],
  //   [{ value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }],
  //   [{ value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }],
  //   [{ value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }, { value: -2 }],
  // ]

  if (true) {
    if (!data) {
      const SHEET_ID = "1aqtQjOjc3rRSgORzr-dsqRiP9KFoJOj9wr9nlM5N_6o";
      const RANGE = "SWC Energy calculator!A:Z";

      fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${escape(
          RANGE
        )}?majorDimension=ROWS&valueRenderOption=FORMULA`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      )
        .then((response) => response.json())
        .then((json) => {
          setData(json.values);
        });

      return <CircularProgress />;
    }

    if (data && !grid) {
      const d = calculateEnergyFigures(data, floorArea);

      const headings = Object.keys(d[0])
        .filter(
          (s) =>
            !s.startsWith("$") && s !== "Identifier" && s !== "SWC Constants"
        )
        .map((value) => ({ value, readOnly: true }));

      const gridData = [
        headings,
        ...d.reduce((acc, curr) => {
          const o = [];
          headings.forEach(({ value }) => {
            const v = curr[value];
            if (typeof v === "string" && v.startsWith("=")) {
              o.push({ value: curr.$val, expr: v, className: "equation" });
            } else {
              o.push({ value: v });
            }
          });

          acc.push(o);
          return acc;
        }, []),
      ];

      setGrid(gridData as any);
    }

    return (
      <>
        <h2>Energy Calculator</h2>
        <label>
          D2: (Gross internal Area)
          <input
            type="number"
            value={floorArea}
            onChange={(e) => setFloorArea(Number(e.target.value))}
          />
          m2
        </label>

        {grid && (
          <MyReactDataSheet
            data={grid}
            valueRenderer={(cell) => cell.value}
            dataRenderer={(cell) => cell.expr}
            onContextMenu={(e, cell, i, j) =>
              cell.readOnly ? e.preventDefault() : null
            }
            onCellsChanged={(changes) => {
              const newGrid = grid.map((row) => [...row]);
              changes.forEach(({ row, col, value }) => {
                grid[row][col] = { ...grid[row][col], value };
              });
              setGrid(newGrid as any);
            }}
            cellRenderer={cellRenderer}
          />
        )}
      </>
    );
  }

  return (
    <GoogleLogin
      scope={process.env.REACT_APP_GOOGLE_API_SCOPE}
      clientId={process.env.REACT_APP_GOOGLE_API_CLIENT_ID}
      buttonText="Login"
      onSuccess={(u) =>
        set((draft) => {
          draft.user = u;
        })
      }
      onFailure={alert}
      onAutoLoadFinished={identity}
      cookiePolicy={"single_host_origin"}
      isSignedIn
    />
  );
};

export default EnergyPanel;
