export function loadRange(dateFrom, dateTo, collection) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:5000/api?dateFrom=${dateFrom}&dateTo=${dateTo}&collection=${collection}`;
    fetch(url)
      .then(response => response.json())
      .then(resolve, reject);
  });
}
