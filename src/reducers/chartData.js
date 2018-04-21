import {
  dataLoadStart,
  dataLoadSuccess,
  dataLoadFail
} from "../actions/index.js";

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
    return {
      ...state,
      loadedVersion: action.payload.version,
      error: undefined,
      isLoading: true
    };
  } else if (action.type === dataLoadSuccess.type) {
    if (action.payload.version === state.loadedVersion) {
      return {
        ...state,
        data: action.payload.data,
        isLoading: false
      };
    }
  } else if (action.type === dataLoadFail.type) {
    if (action.payload.version === state.loadedVersion) {
      return {
        ...state,
        error: action.payload.error,
        isLoading: false
      };
    }
  }

  return state;
}
