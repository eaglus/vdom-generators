function loadRange(dateFrom, dateTo, collection) {
  const url = `http://localhost/?dateFrom=${dateFrom}&dateTo=${dateTo}&collection=${collection}`;
  return fetch(url).then(response => response.json());
}
