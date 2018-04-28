import { createLoader } from "./load/index.js";
import * as serverApi from "./load/serverApi.js";

const loader = createLoader({
  indexedDB: window.indexedDB,
  IDBKeyRange: window.IDBKeyRange,
  serverApi
});

function actionCreator(type) {
  const resultFn = payload => {
    return {
      payload,
      type
    };
  };
  resultFn.type = type;
  return resultFn;
}

export const setActiveFilterType = actionCreator("SET_ACTIVE_FILTER_TYPE");
export const setActiveFilterFrom = actionCreator("SET_ACTIVE_FILTER_FROM");
export const setActiveFilterTo = actionCreator("SET_ACTIVE_FILTER_TO");

export const dataLoadStart = actionCreator("DATA_LOAD_START");
export const dataLoadSuccess = actionCreator("DATA_LOAD_SUCCESS");
export const dataLoadFail = actionCreator("DATA_LOAD_FAIL");

function runLoadAction(actionFn) {
  return payload => {
    return (dispatch, getState) => {
      const action = actionFn(payload);
      if (action) {
        dispatch(action);
      }

      const { filter, chartData } = getState();
      const { activeFilterType } = filter;
      const { from, to } = filter[activeFilterType];
      const version = chartData.loadedVersion + 1;

      dispatch(dataLoadStart({ version }));

      const dateFrom = Date.UTC(from, 0, 1);
      const dateTo = Date.UTC(to, 0, 1);
      loader(dateFrom, dateTo, activeFilterType)
        .then(data => {
          dispatch(dataLoadSuccess({ version, data }));
        })
        .catch(error => {
          console.error(error);
          dispatch(dataLoadFail({ version, error: error.message }));
        });
    };
  };
}

export const loadForFilterType = runLoadAction(setActiveFilterType);
export const loadForFilterFrom = runLoadAction(setActiveFilterFrom);
export const loadForFilterTo = runLoadAction(setActiveFilterTo);
export const loadForCurrentFilter = runLoadAction(() => undefined);
