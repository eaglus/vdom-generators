import { h } from "./lib/vdom/h.js";
import { makeStore, combineReducers } from "./lib/store/store.js";
import { loadForCurrentFilter } from "./actions/index.js";

import { makeUpdater } from "./lib/vdom/interpreters/documentInterpeter.js";
import { filterReducer } from "./reducers/filters.js";
import { chartDataReducer } from "./reducers/chartData.js";
import { App } from "./components/app/index.js";

const reducer = combineReducers({
  filter: filterReducer,
  chartData: chartDataReducer
});

function main() {
  const rootElement = document.getElementById("root");

  const onUpdate = state => {
    updater(h(App, state));
  };

  const store = makeStore(reducer, onUpdate);
  const updater = makeUpdater(rootElement, store.dispatch);
  store.update();
  store.dispatch(loadForCurrentFilter());
}

main();
