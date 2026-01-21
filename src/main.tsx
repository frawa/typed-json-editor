import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { apiConnect, localConnect } from "./typeJson/typedJson";

const params = new URLSearchParams(window.location.search);
const useLocal = params.has('local')

const connect = useLocal ? localConnect() : apiConnect();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App connect={connect} />
  </React.StrictMode>,
);
