import {
  FindStartChunk,
  FindNextChunk,
  FindClose,
  LoadChunks
} from "./commands";
import { assert } from "../../lib/utils/index.js";
import { openIndexedDB } from "../../lib/utils/indexedDB.js";
import { alignToMonthStart, alignToMonthEnd } from "../../lib/utils/date.js";

export function splitToMonths(data) {
  const monthsData = [];
  let monthData;
  let currentYear;
  let currentMonth;
  let prevDate = 0;

  data.forEach(value => {
    const date = new Date(value.date);

    assert(prevDate < value.date, "Bad date order in input data");

    prevDate = value.date;

    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    if (month !== currentMonth || year !== currentYear) {
      currentMonth = month;
      currentYear = year;

      if (monthData) {
        monthsData.push({
          date: monthData[0].date,
          data: monthData
        });
      }
      monthData = [value];
    } else {
      monthData.push(value);
    }
  });

  if (monthData) {
    monthsData.push({
      date: monthData[0].date,
      data: monthData
    });
  }

  return monthsData;
}

export function createCommandHandler(env) {
  const getDbPromise = () => {
    return openIndexedDB(env, "meteodb", 1, upgradeDB => {
      const temperature = upgradeDB.createObjectStore("temperature", {
        keyPath: "date"
      });
      temperature.createIndex("date", "date", { unique: true });

      const precipitation = upgradeDB.createObjectStore("precipitation", {
        keyPath: "date"
      });
      precipitation.createIndex("date", "date", { unique: true });
    });
  };

  return (command, callback, errorCallback) => {
    if (command instanceof FindStartChunk) {
      const { context, collection, date } = command;
      const dbPromise =
        context && context.db ? Promise.resolve(context.db) : getDbPromise();

      dbPromise
        .then(db => {
          const tx = db.transaction(collection, "readonly");
          const store = tx.objectStore(collection);
          const range = env.IDBKeyRange.lowerBound(alignToMonthStart(date));
          const index = store.index("date");
          const request = index.openCursor(range);
          request.onsuccess = event => {
            const cursor = event.target.result;
            const key = cursor && cursor.key;
            const value = cursor && cursor.value;
            callback({
              chunk: key !== undefined ? value.data : undefined,
              context: {
                db,
                cursor,
                request
              }
            });
          };
          request.onerror = errorCallback;
        })
        .catch(errorCallback);
    } else if (command instanceof FindNextChunk) {
      const { context } = command;
      const { cursor, request } = context;

      cursor.continue();
      request.onsuccess = () => {
        const key = cursor.key;
        const value = key ? cursor.value : undefined;
        const chunk = value && value.data;
        callback({
          chunk,
          context
        });
      };
      request.onerror = errorCallback;
    } else if (command instanceof FindClose) {
      const {
        context: { db }
      } = command;
      db.close();
      callback({});
    } else if (command instanceof LoadChunks) {
      const { dateFrom, dateTo, collection } = command;
      const dataPromise = env.serverApi.loadRange(
        alignToMonthStart(dateFrom),
        alignToMonthEnd(dateTo),
        collection
      );
      return dataPromise.then(data => {
        return getDbPromise().then(db => {
          const tx = db.transaction(collection, "readwrite");

          tx.oncomplete = () => {
            callback({ db });
          };
          tx.onerror = errorCallback;

          const store = tx.objectStore(collection);
          const splitted = splitToMonths(data);

          splitted.forEach(monthData => store.put(monthData));
        }, errorCallback);
      }, errorCallback);
    }
  };
}
