import { initAction } from "./actions.js";
import { merge } from "../utils/index.js";

export function combineReducers(reducers) {
  return (action, state) => {
    for (let key of Object.keys(reducers)) {
      const oldPart = state && state[key];
      const newPart = reducers[key](action, oldPart);
      if (newPart !== oldPart) {
        state = merge(state, {
          [key]: newPart
        });
      }
    }
    return state;
  };
}

export function makeStore(reducer, onUpdate, initialState) {
  let state = merge(reducer(initAction(), undefined), initialState || {});
  const getState = () => state;

  const dispatch = action => {
    if (typeof action === "function") {
      action(dispatch, getState);
    } else {
      const newState = reducer(action, state);
      if (newState !== state) {
        state = newState;
        onUpdate(newState, dispatch);
      }
    }
  };

  return {
    dispatch,
    update: () => onUpdate(state, dispatch)
  };
}
