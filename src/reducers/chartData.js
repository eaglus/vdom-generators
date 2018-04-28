import {
  dataLoadStart,
  dataLoadSuccess,
  dataLoadFail
} from "../actions/index.js";

import { merge } from "../lib/utils/index.js";

const initialState = {
  data: [],
  loadedVersion: 0,
  isLoading: false,
  error: undefined
};

export function chartDataReducer(action, state) {
  if (!state) {
    return initialState;
  } else if (action.type === dataLoadStart.type) {
    return merge(state, {
      loadedVersion: action.payload.version,
      error: undefined,
      isLoading: true
    });
  } else if (action.type === dataLoadSuccess.type) {
    if (action.payload.version === state.loadedVersion) {
      return merge(state, {
        data: action.payload.data,
        isLoading: false
      });
    }
  } else if (action.type === dataLoadFail.type) {
    if (action.payload.version === state.loadedVersion) {
      return merge(state, {
        error: action.payload.error,
        isLoading: false
      });
    }
  }

  return state;
}
