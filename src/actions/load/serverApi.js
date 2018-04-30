import { CanceledException } from "../../lib/utils/index.js";

export function loadRange(dateFrom, dateTo, collection, cancelToken) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:5000/api?dateFrom=${dateFrom}&dateTo=${dateTo}&collection=${collection}`;
    const xhr = new XMLHttpRequest();
    cancelToken.addCancelHandler(() => xhr.abort());

    xhr.onreadystatechange = () => {
      if (cancelToken.isCanceled()) {
        reject(new CanceledException());
      } else if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const result =
            typeof xhr.response === "string"
              ? JSON.parse(xhr.response)
              : xhr.response;

          resolve(result);
        } else {
          reject(xhr.responseText);
        }
      }
    };
    xhr.open("GET", url, true);
    xhr.send(null);
  });
}
