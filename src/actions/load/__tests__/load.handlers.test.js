import { IDBFactory, IDBKeyRange } from "shelving-mock-indexeddb";

import { createCommandHandler, splitToMonths } from "../loadHandlers.js";
import { FindStartChunk, FindNextChunk, LoadChunks } from "../commands.js";
import { createLoader } from "../index.js";

import { loadRange } from "./mockServerApi.js";

describe("helper functions", () => {
  it("splitToMonths", () => {
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
  let handler;
  let environment;
  beforeEach(() => {
    environment = {
      serverApi: {
        loadRange
      },
      indexedDB: new IDBFactory(),
      IDBKeyRange
    };
    handler = createCommandHandler(environment);
  });

  it("FindStartChunk", done => {
    const res = handler(
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

  it("Load chunks", done => {
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

  it("FindNextChunk", done => {
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

  it("Full load", done => {
    const loader = createLoader(environment);
    const dateFrom = Date.UTC(2001, 2, 5);
    const dateTo = Date.UTC(2001, 8, 15);
    return loader(dateFrom, dateTo, "temperature").then(result => {
      expect(result).toBeTruthy();
      expect(result[0].date).toEqual(dateFrom);
      expect(result[result.length - 1].date).toEqual(dateTo);
      done();
    }, done);
  });
});
