import { assert } from "../../lib/utils/index.js";
import { durationDay } from "../../lib/utils/date.js";
import {
  FindStartChunk,
  FindUpperBoundDate,
  FindNextChunk,
  FindClose,
  LoadChunks
} from "./commands.js";

export function* dataLoader(dateFrom, dateTo, collection, startContext) {
  const start = yield new FindStartChunk(dateFrom, collection, startContext);
  const data = [];
  let dataEnd = dateFrom - 1;

  let chunk = start.chunk;
  if (chunk && chunk[0].date <= dateFrom) {
    while (chunk && dataEnd < dateTo) {
      for (let i in chunk) {
        const value = chunk[i];
        const { date } = value;
        if (date > dateTo) {
          break;
        } else if (date >= dateFrom) {
          data.push(value);
          dataEnd = date;
        }
      }

      if (dataEnd < dateTo) {
        ({ chunk } = yield new FindNextChunk(start.context));
      }
    }
  }

  if (dataEnd < dateFrom) {
    let upperBoundDate;

    if (!chunk) {
      upperBoundDate = yield new FindUpperBoundDate(
        dateFrom,
        collection,
        start.context
      );
    }

    const loadTo = chunk ? chunk[0].date - 1 : dateTo;
    const loadFrom =
      upperBoundDate !== undefined ? upperBoundDate + durationDay : dateFrom;

    yield new FindClose(start.context);
    const loadedContext = yield new LoadChunks(loadFrom, loadTo, collection);

    const loadedData = yield* dataLoader(
      dateFrom,
      dateTo,
      collection,
      loadedContext
    );
    return loadedData;
  } else if (dataEnd >= dateTo) {
    yield new FindClose(start.context);

    return data;
  } else {
    assert(!chunk);

    yield new FindClose(start.context);
    const loadedContext = yield new LoadChunks(dataEnd + 1, dateTo, collection);

    const finalData = yield* dataLoader(
      dataEnd + 1,
      dateTo,
      collection,
      loadedContext
    );
    return data.concat(finalData);
  }
}
