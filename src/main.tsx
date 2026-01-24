import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { apiConnect, localConnect } from "./typeJson/typedJson";
import wasmUrl from "./wasm/typedJson.wasm?url"
import { loadUnisonModule } from "./wasm/typedJsonLoader.js"

const params = new URLSearchParams(window.location.search);
const useLocal = params.has('local');

if (useLocal) {
  const wasm = fetch(wasmUrl);
  //const { log, exports } = await loadUnisonModule(wasm);
  const { exports } = await loadUnisonModule(wasm);
  // @ts-ignore
  window.validate = exports.validate;
  // @ts-ignore
  window.suggest = exports.suggest;
  // @ts-ignore
  window.validateSchema = exports.validateSchema;
  // @ts-ignore
  window.suggestSchema = exports.suggestSchema;
}

const connect = useLocal ? localConnect() : apiConnect();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App connect={connect} />
  </React.StrictMode>,
);
