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
