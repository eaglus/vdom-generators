import { assert } from '../../lib/utils.js';
import { FindStartChunk, FindNextChunk, LoadChunks } from './commands';

export function* dataLoader(dateFrom, dateTo, collection) {
  let { chunk, context } = yield new FindStartChunk(dateFrom, collection);
  const data = [];
  let dataEnd = dateFrom - 1;

  console.log('start chunk', chunk);
  while (chunk && chunk[0].date <= dateFrom && dataEnd < dateTo) {
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

    console.log('ZZZ', data);
    if (dataEnd < dateTo) {
      ({ chunk, context } = yield new FindNextChunk(context));
      console.log(data, chunk, chunk && chunk[0].date <= dateFrom && dataEnd < dateTo);
    }
  }

  if (dataEnd < dateFrom) {
    const loadTo = chunk ? chunk[0].date - 1 : dateTo;
    yield new LoadChunks(dateFrom, loadTo, collection);
    const loadedData = yield* dataLoader(dateFrom, dateTo, collection);
    return loadedData;
  } else if (dataEnd >= dateTo) {
    return data;
  } else {
    assert(!chunk);
    yield new LoadChunks(dataEnd + 1, dateTo, collection);
    const finalData = yield* dataLoader(dataEnd + 1, dateTo, collection);
    return data.concat(finalData);
  }
}
