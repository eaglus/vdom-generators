import * as TemperatureData from '../temperature.json';
import * as PrecipitationData from '../precipitation.json';
import { assert } from '../lib/utils/index.js';

const temperature = convertData(TemperatureData);
const precipitation = convertData(PrecipitationData);

const collections = {
  temperature,
  precipitation
}

export function getRange(dateFrom, dateTo, collection) {
  const table = collections[collection];

  const indexFrom = table.findIndex(item => item.date === dateFrom);
  assert(indexFrom !== -1);

  const indexTo = table.findIndex(item => item.date === dateTo);
  assert(indexTo !== -1);

  return table.slice(indexFrom, indexTo + 1);
}

export function convertData(data) {
  return data.map(item => {
    const [year, month, day] = item.t.split('-').map(v => parseInt(v, 10));
    return {
      date: Date.UTC(year, month, day)
    }
  });
}
