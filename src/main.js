import { h } from "./lib/vdom/h.js";
import { makeStore, combineReducers } from "./lib/store/store.js";
import { initAction } from "./lib/store/actions.js";
import { makeUpdater } from "./lib/vdom/interpreters/documentInterpeter.js";
import { filterReducer } from "./reducers/filters.js";
import { App } from "./components/app/index.js";

const reducer = combineReducers({
  filter: filterReducer
});

function main() {
  const rootElement = document.getElementById("root");

  const onUpdate = state => {
    const props = {
      ...state
    };
    updater(h(App, { ...props }));
  };

  const store = makeStore(reducer, onUpdate);
  const updater = makeUpdater(rootElement, store.dispatch);
  store.update();
}

main();
