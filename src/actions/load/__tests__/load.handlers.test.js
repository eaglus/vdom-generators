import { IDBFactory, IDBKeyRange, reset } from "shelving-mock-indexeddb";

import { createCommandHandler, splitToMonths } from "../loadHandlers.js";
import {
  FindStartChunk,
  FindNextChunk,
  LoadChunks,
  FindUpperBoundDate
} from "../commands.js";

import { loadRange } from "./mockServerApi.js";

describe("helper functions", () => {
  test("splitToMonths", () => {
    const data = [
      //test data format: [day, month, year]
      [1, 0, 2017],
      [2, 0, 2017],
      [1, 0, 2018],
      [2, 0, 2018],
      [30, 0, 2018],
      [1, 1, 2018],
      [2, 1, 2018]
    ].map(([day, month, year]) => ({
      date: Date.UTC(year, month, day)
    }));

    const split = splitToMonths(data);
    expect(split.length).toEqual(3);
    expect(split[0].data.length).toEqual(2);
    expect(split[1].data.length).toEqual(3);
    expect(split[2].data.length).toEqual(2);
  });
});

describe("loadHandlers", () => {
  let environment = {
    serverApi: {
      loadRange
    },
    indexedDB: new IDBFactory(),
    IDBKeyRange
  };
  let handler = createCommandHandler(environment);

  beforeEach(() => {
    reset();
  });

  afterEach(() => {
    reset();
  });

  test("FindStartChunk for empty collection", done => {
    handler(
      new FindStartChunk(100500, "temperature", {}),
      result => {
        const { chunk, context } = result;
        expect(chunk).toBeFalsy();
        expect(context.db).toBeTruthy();
        done();
      },
      done
    );
  });

  test("FindUpperBoundDate for empty collection", done => {
    handler(
      new FindStartChunk(100500, "temperature", {}),
      result => {
        const { context } = result;
        handler(
          new FindUpperBoundDate(100500, "temperature", context),
          result => {
            expect(result).toBeUndefined();
            done();
          },
          done
        );
      },
      done
    );
  });

  test("FindUpperBoundDate for non-empty collection", done => {
    const loadedFrom = Date.UTC(2001, 2, 1);
    const loadedTo = Date.UTC(2006, 11, 31);

    const checkBefore = callback => context => {
      handler(
        new FindUpperBoundDate(Date.UTC(2000, 2, 1), "temperature", context),
        result => {
          expect(result).toBeUndefined(); //no data loaded before 2001 year
          callback(context);
        },
        done
      );
    };

    const checkAfter = callback => context => {
      handler(
        new FindUpperBoundDate(Date.UTC(2100, 2, 1), "temperature", context),
        result => {
          expect(result).toBe(loadedTo); //data end is..
          callback(context);
        },
        done
      );
    };

    handler(
      new LoadChunks(loadedFrom, loadedTo, "temperature"),
      checkBefore(
        checkAfter(() => {
          done();
        })
      ),
      done
    );
  });

  test("Load chunks", done => {
    const dateFrom = Date.UTC(2001, 2, 1);
    const dateTo = Date.UTC(2001, 8, 1);
    const loadChunks = callback =>
      handler(new LoadChunks(dateFrom, dateTo, "temperature"), callback, done);

    const checkData = context => {
      const { db } = context;
      expect(db).toBeTruthy();

      const keys = Array.from(db._data.temperature.records.keys());
      const expectDates = [2, 3, 4, 5, 6, 7, 8].map(m => Date.UTC(2001, m, 1));
      expect(keys).toEqual(expectDates);

      db.close();
    };

    loadChunks(context => {
      checkData(context);
      let cnt = 2;
      const handleLoad = context => {
        checkData(context);
        cnt--;
        if (!cnt) {
          done();
        }
      };

      loadChunks(handleLoad);
      loadChunks(handleLoad);
    });
  });

  test("FindNextChunk", done => {
    const dateFrom = Date.UTC(2001, 2, 5);
    const dateTo = Date.UTC(2001, 8, 15);

    const loadChunks = callback =>
      handler(new LoadChunks(dateFrom, dateTo, "temperature"), callback, done);

    let loadedContext;
    loadChunks(context => {
      loadedContext = context;
      handler(
        new FindStartChunk(Date.UTC(2001, 2, 6), "temperature", context),
        ({ context, chunk }) => {
          expect(context.db).toBe(loadedContext.db);
          expect(chunk[0].date).toBe(Date.UTC(2001, 2, 1));

          handler(
            new FindNextChunk(context),
            ({ context, chunk }) => {
              expect(context.db).toBe(loadedContext.db);
              expect(chunk).toBeTruthy();
              expect(chunk[0].date).toBe(Date.UTC(2001, 3, 1));
              done();
            },
            done
          );
        },
        done
      );
    });
  });
});
