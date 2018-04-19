import { FindStartChunk, FindNextChunk, FindClose, LoadChunks } from './commands';
import { compose } from '../../lib/utils/index.js';
import { alignToMonthStart, alignToMonthEnd } from '../../lib/utils/date.js';
import { openIndexedDB, indexOpenCursor, cursorContinue, objectStoreGet, objectStorePut } from '../../lib/utils/indexedDB.js';

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
