import Drawer from "@material-ui/core/Drawer";
import { identity } from "ramda";
import React, { useState } from "react";
import GoogleLogin from "react-google-login";
import { useStore } from "../shared/store";
import { calculateEnergyFigures } from "./energyCalculator";

const Content = () => {
  const [user, set] = useStore((store) => [store.user, store.set]);
  const [data, setData] = useState(null);
  const [floorArea, setFloorArea] = useState(80);

  if (user) {
    if (!data) {
      const SHEET_ID = "1aqtQjOjc3rRSgORzr-dsqRiP9KFoJOj9wr9nlM5N_6o";
      const RANGE = "SWC Energy calculator!A:Z";

      // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get?authuser=1&apix_params=%7B%22spreadsheetId%22%3A%221aqtQjOjc3rRSgORzr-dsqRiP9KFoJOj9wr9nlM5N_6o%22%2C%22range%22%3A%22SWC%20Energy%20calculator!A%3AZ%22%2C%22majorDimension%22%3A%22ROWS%22%2C%22valueRenderOption%22%3A%22FORMULA%22%2C%22%24.xgafv%22%3A%221%22%2C%22prettyPrint%22%3Atrue%7D

      const request = fetch(
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
        .then(setData);

      return <h1>loading data</h1>;
    }

    return (
      <>
        <label>
          D2: (Gross internal Area)
          <input
            type="number"
            value={floorArea}
            onChange={(e) => setFloorArea(Number(e.target.value))}
          />
          m2
        </label>
        <pre>
          {JSON.stringify(
            calculateEnergyFigures(data, floorArea)
              .filter((r) => r.Name && r.$val)
              .map((r) => [r.Name, `${r.$val} ${r.Units}`, r.$expr]),
            null,
            2
          )}
        </pre>
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

const SideBar = () => {
  return (
    <Drawer open onClose={console.log} anchor="right" variant="permanent">
      <Content />
    </Drawer>
  );
};

export default <SideBar />;
