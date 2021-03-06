import {
  setActiveFilterType,
  setActiveFilterFrom,
  setActiveFilterTo
} from "../actions/index.js";

import { merge } from "../lib/utils/index.js";

const MIN_YEAR = 1881;
const MAX_YEAR = 2007;

const initialState = {
  temperature: {
    from: MIN_YEAR,
    to: MAX_YEAR
  },

  precipitation: {
    from: MIN_YEAR,
    to: MAX_YEAR
  },

  minYear: MIN_YEAR,
  maxYear: MAX_YEAR,

  activeFilterType: "temperature"
};

export const ACTIVE_FILTER = {
  TEMPERATURE: "temperature",
  PRECIPITATION: "precipitation"
};

const updateActiveFilter = state => updater => {
  const { activeFilterType } = state;
  const prevFilter = state[activeFilterType];
  return merge(state, {
    [activeFilterType]: merge(prevFilter, updater(prevFilter))
  });
};

export function filterReducer(action, state) {
  const updateFilter = updateActiveFilter(state);
  if (!state) {
    return initialState;
  } else if (action.type === setActiveFilterType.type) {
    return merge(state, {
      activeFilterType: action.payload
    });
  } else if (action.type === setActiveFilterFrom.type) {
    const { maxYear, minYear } = state;
    return updateFilter(filter => {
      const { payload: from } = action;
      const fromNorm = Math.max(Math.min(from, maxYear - 1), minYear);
      return merge(filter, {
        from: fromNorm,
        to: Math.max(fromNorm + 1, filter.to)
      });
    });
  } else if (action.type === setActiveFilterTo.type) {
    const { maxYear, minYear } = state;
    return updateFilter(filter => {
      const { payload: to } = action;
      const toNorm = Math.min(Math.max(to, minYear + 1), maxYear);
      return merge(filter, {
        to: toNorm,
        from: Math.min(toNorm - 1, filter.from)
      });
    });
  } else {
    return state;
  }
}
