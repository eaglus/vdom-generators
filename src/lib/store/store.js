import { initAction } from "./actions.js";

export function combineReducers(reducers) {
  return (action, state) => {
    for (let key of Object.keys(reducers)) {
      const oldPart = state && state[key];
      const newPart = reducers[key](action, oldPart);
      if (newPart !== oldPart) {
        state = {
          ...state,
          [key]: newPart
        };
      }
    }
    return state;
  };
}

export function makeStore(reducer, onUpdate) {
  let state = reducer(initAction(), undefined);
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