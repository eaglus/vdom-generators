import { assert } from "../lib/utils/index.js";

const TemperatureData = require("../../temperature.json");
const PrecipitationData = require("../../precipitation.json");

const temperature = convertData(TemperatureData);
const precipitation = convertData(PrecipitationData);

const collections = {
  temperature,
  precipitation
};

export function getRange(dateFrom, dateTo, collection) {
  const table = collections[collection];

  const indexFrom = table.findIndex(item => item.date === dateFrom);
  assert(indexFrom !== -1);

  const indexTo = table.findIndex(item => item.date === dateTo);
  assert(indexTo !== -1);

  return table.slice(indexFrom, indexTo + 1);
}

function convertData(data) {
  //imported json data is not array
  const keys = Object.keys(data);
  const res = keys.map(key => {
    const item = data[key];
    if (!item.t) {
      console.log("!!!!", item);
    }
    const [year, month, day] = item.t.split("-").map(v => parseInt(v, 10));
    return {
      date: Date.UTC(year, month - 1, day),
      value: item.v
    };
  });

  return res;
}
