import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

const [, path] = window.location.pathname.split("/");
const AppComponent = React.lazy(() => import(`./${path || "App"}`));

ReactDOM.render(
  <React.StrictMode>
    <React.Suspense fallback={<div>Loading...</div>}>
      <AppComponent />
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
