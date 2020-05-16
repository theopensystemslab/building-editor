import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

const [, path] = window.location.pathname.split("/");

const RootComponent = React.lazy(() =>
  import(`./${path || "hangar"}`).catch(() => {
    // redirect to root if path is not valid
    if (window.location.href !== process.env.REACT_APP_URL) {
      window.location.href = process.env.REACT_APP_URL;
    }
  })
);

ReactDOM.render(
  <React.StrictMode>
    <React.Suspense fallback={<div>Loading...</div>}>
      <RootComponent />
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
