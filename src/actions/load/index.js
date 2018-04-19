export class CanceledException extends Error {
}

class ServerLoader {

  loadRange(dateFrom, dateTo, collection) {
    if (this.cancelPrevious) {
      this.cancelPrevious();
    }

    const url = `http://localhost/?dateFrom=${dateFrom}&dateTo=${dateTo}&collection=${collection}`;
    let canceled = false;
    const result = fetch(url).then(response => {
      if (canceled) {
        throw new CanceledException();
      }
      return response.json();
    });

    this.cancelPrevious = () => {
      canceled = true;
    };

    this.lastResult = result;
    return result;
  }
}

const serverLoader = new ServerLoader();

class IndexedDBLoader {
  db = null;

  getDb() {
    if (!this.db) {
      this.db = indexedDB.open('meteodb', upgradeDB => {
        const temperature = upgradeDB.createObjectStore('temperature');
        temperature.createIndex("date", "date", { unique: true });

        const precipitation = upgradeDB.createObjectStore('precipitation', { keyPath: 'date' });
        precipitation.createIndex("date", "date", { unique: true });
      });
    }
    return this.db;
  }

  loadRange(dateFrom, dateTo, collection) {
    return this.getDb().then(db => {
      const tx = db.transaction(`${collection} read`, "readonly");
      const store = tx.objectStore(collection);
      const range = IDBKeyRange.lowerBound(dateFrom);
      const index = store.index('date');
      return index.openCursor(range);
    }).then(cursor => {
      const data = [];
      let dateToFound = dateFrom;
      if (cursor) {
        ///loadData ...
      }

      if (dateToFound !== dateTo) {

      }
    });
  }
}

const loader = new IndexedDBLoader();

export function loaderFactory() {

}


export function loadRange() {

}