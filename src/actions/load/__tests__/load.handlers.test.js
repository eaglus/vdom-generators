import { IDBFactory, IDBKeyRange, reset } from "shelving-mock-indexeddb";
import { loadRange, getRange } from "./serverApi.js";
import { createCommandHandler, splitToMonths } from "../loadHandlers.js";
import { FindStartChunk, LoadChunks } from "../commands.js";

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
  beforeEach(() => {
    handler = createCommandHandler({
      serverApi: {
        loadRange
      },
      indexedDB: new IDBFactory(),
      IDBKeyRange
    });
  });

  it("FindStartChunk", done => {
    const res = handler(new FindStartChunk(100500, "temperature", {}));
    res.then(result => {
      const { chunk, context } = result;
      expect(chunk).toBeFalsy();
      expect(context.db).toBeTruthy();
      done();
    });
  });

  it("Load chunks", done => {
    const dateFrom = Date.UTC(2001, 2, 5);
    const dateTo = Date.UTC(2001, 8, 15);
    const res = handler(new LoadChunks(dateFrom, dateTo, "temperature", {}));
    res
      .then(context => {
        expect(context.db).toBeTruthy();
        return handler(new LoadChunks(dateFrom, dateTo, "temperature"));
      })
      .then(() => done());
  });
});
