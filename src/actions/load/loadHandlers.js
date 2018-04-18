import { FindStartChunk, FindNextChunk, FindClose, LoadChunks } from './commands';
import { compose } from '../../lib/utils/index.js';
import { alignToMonthStart, alignToMonthEnd } from '../../lib/utils/date.js';

function getResult(event) {
  return event.target.result;
}

function resolveResult(resolveFn) {
  return compose(resolveFn, getResult);
}

function resolveResultWithTarget(resolveFn) {
  return compose(resolveFn, event => [event.target.result, target]);
}

function rejectErrorCode(rejectFn, message) {
  return compose(rejectFn, event => `${message}: ${event.target.errorCode}`);
}

function openIndexedDB(env, dbName, upgradeFn) {
  return new Promise((resolve, reject) => {
    const request = env.indexedDB.open(dbName);
    request.onupgradeneeded = function (e) {
      upgradeFn(e.currentTarget.result);
      open();
    };

    request.onsuccess = resolveResult(resolve);
    request.onerror = rejectErrorCode(reject, `Error open database ${dbName}`);
  });
}

function indexOpenCursor(index) {
  return new Promise((resolve, reject) => {
    const request = index.openCursor();
    request.onsuccess = resolveResultWithTarget(resolve);
    request.onerror = rejectErrorCode(reject, `Error open cursor`);
  });
}

function cursorContinue(cursor, cursorRequest) {
  return new Promise((resolve, reject) => {
    cursorRequest.onsuccess = resolveResultWithTarget(resolve);
    cursorRequest.onerror = rejectErrorCode(reject, `Error continue cursor`);
    cursor.continue();
  });
}

function objectStoreGet(store, key) {
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = resolveResult(resolve);
    request.onerror = rejectErrorCode(reject, 'Can\'t get a value by key' + key);
  });
}

function objectStorePut(store, value) {
  return new Promise((resolve, reject) => {
    const request = store.put(value);
    request.onsuccess = resolveResult(resolve);
    request.onerror = rejectErrorCode(reject, 'Can\'t put a value with key ' + value.date);
  });
}

function splitToMonths(data) {
  const monthsData = [];
  let monthData;
  let currentYear;
  let currentMonth;
  data.forEach(value => {
    const date = new Date(value.date);
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    if (month !== currentMonth || year !== currentYear) {
      currentMonth = month;
      currentYear = year;
      if (monthData) {
        monthsData.push({
          data: monthData,
          date: Number(date)
        });
        monthData = [];
      }
    } else {
      monthData.push(value);
    }
  });
  return months;
}

export function createCommandHandler(env) {
  const IndexedDB = env.IndexedDB;
  const getDbPromise = () => {
    return openIndexedDB(env, 'meteodb', upgradeDB => {
      const temperature = upgradeDB.createObjectStore('temperature');
      temperature.createIndex("date", "date", { unique: true });

      const precipitation = upgradeDB.createObjectStore('precipitation', { keyPath: 'date' });
      precipitation.createIndex("date", "date", { unique: true });
    });
  }

  return (command) => {
    if (command instanceof FindStartChunk) {
      const { context, collection } = command;
      const dbPromise = context.db || getDbPromise();

      return dbPromise.then(db => {
        const tx = db.transaction(`${collection} read`, "readonly");
        const store = tx.objectStore(collection);
        const range = env.IDBKeyRange.lowerBound(dateFrom);
        const index = store.index('date');
        return indexOpenCursor(index).then(result => [db, result]);
      }).then(([db, [cursor, cursorRequest]]) => {
        const key = cursor.key;
        const value = cursor.value;
        return {
          chunk: key !== undefined ? value.data : undefined,
          context: {
            db,
            cursor,
            cursorRequest
          }
        };
      });
    } else if (command instanceof FindNextChunk) {
      const { context: { db, cursor, cursorRequest } } = command;
      return cursorContinue(cursor, cursorRequest).then(([cursor, cursorRequest]) => {
        const key = cursor.key;
        if (key === undefined) {
          db.close();
          return {};
        } else {
          const value = cursor.value;
          return {
            chunk: value.data,
            context: {
              db,
              cursor,
              cursorRequest
            }
          };
        }
      });
    } else if (command instanceof FindClose) {
      const { context: { db } } = command;
      db.close();
      return null;
    } else if (command instanceof LoadChunks) {
      const { dateFrom, dateTo, collection } = command;
      const dataPromise = env.serverApi.loadRange(alignToMonthStart(dateFrom), alignToMonthEnd(dateTo), collection);
      return dataPromise.then(data => {
        return getDbPromise().then(db => {
          const tx = db.transaction(`${collection} read`, "readwrite");
          const store = tx.objectStore(collection);
          const splitted = splitToMonths(data);
          const requests = splitted.map(monthData => {
            if (monthData.length === 0) {
              return Promise.resolve();
            } else {
              const startDate = monthData.date;
              const get = objectStoreGet(store, startDate);
              return get.then(getResult).then(data => {
                if (!data) {
                  return objectStorePut(store, startDate, monthData)
                };
              });
            }
          });
          return Promise.all(requests).then(() => ({
            db
          }));
        });
      });
    }
  }
}
