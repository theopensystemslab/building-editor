import CircularProgress from "@material-ui/core/CircularProgress";
import { identity } from "ramda";
import React, { useState } from "react";
import GoogleLogin from "react-google-login";
import { useStore } from "../../shared/store";
import DataSheet, { defaultDataSheetProps } from "../DataSheet";
import { calculateEnergyFigures } from "./energyCalculator";

const EnergyPanel: React.FC = () => {
  const [user, set] = useStore((store) => [store.user, store.set]);
  const [data, setData] = useState(require("./energyData.json"));
  const [floorArea, setFloorArea] = useState(80);

  const [grid, setGrid] = React.useState();

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
          <DataSheet
            {...defaultDataSheetProps}
            data={grid}
            onCellsChanged={(changes) => {
              const newGrid = grid.map((row) => [...row]);
              changes.forEach(({ row, col, value }) => {
                grid[row][col] = { ...grid[row][col], value };
              });
              setGrid(newGrid as any);
            }}
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
