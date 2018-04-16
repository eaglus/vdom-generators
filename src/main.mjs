import { h } from "./lib/vdom/h.mjs";
import { makeStore, combineReducers } from "./lib/store/store.mjs";
import { initAction } from "./lib/store/actions.mjs";
import { makeUpdater } from "./lib/vdom/interpreters/documentInterpeter.mjs";
import { filterReducer } from "./reducers/filters.mjs";
import { App } from "./components/app/index.mjs";

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
