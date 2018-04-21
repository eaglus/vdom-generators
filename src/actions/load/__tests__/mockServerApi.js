import { getRange as getRangeFn } from "../../../server/utils.js";
export const getRange = getRangeFn;

export function loadRange(dateFrom, dateTo, collection) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = getRange(dateFrom, dateTo, collection);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }, 200);
  });
}
