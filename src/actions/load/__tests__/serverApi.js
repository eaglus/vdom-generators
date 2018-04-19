import { getRange } from '../../../server/utils.js';

export function loadRange(dateFrom, dateTo, collection) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(getRange(dateFrom, dateTo, collection));
    }, 200);
  });
}
