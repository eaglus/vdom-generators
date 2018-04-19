function getResult(event) {
  return event.target.result;
}

function resolveResult(resolveFn) {
  return compose(resolveFn, getResult);
}

function resolveResultWithTarget(resolveFn) {
  return compose(resolveFn, event => [event.target.result, target]);
}

function rejectErrorCode(rejectFn, message) {
  return compose(rejectFn, event => `${message}: ${event.target.errorCode}`);
}

export function openIndexedDB(env, dbName, upgradeFn) {
  return new Promise((resolve, reject) => {
    const request = env.indexedDB.open(dbName);
    request.onupgradeneeded = function (e) {
      upgradeFn(e.currentTarget.result);
      open();
    };

    request.onsuccess = resolveResult(resolve);
    request.onerror = rejectErrorCode(reject, `Error open database ${dbName}`);
  });
}

export function indexOpenCursor(index) {
  return new Promise((resolve, reject) => {
    const request = index.openCursor();
    request.onsuccess = resolveResultWithTarget(resolve);
    request.onerror = rejectErrorCode(reject, `Error open cursor`);
  });
}

export function cursorContinue(cursor, cursorRequest) {
  return new Promise((resolve, reject) => {
    cursorRequest.onsuccess = resolveResultWithTarget(resolve);
    cursorRequest.onerror = rejectErrorCode(reject, `Error continue cursor`);
    cursor.continue();
  });
}

export function objectStoreGet(store, key) {
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = resolveResult(resolve);
    request.onerror = rejectErrorCode(reject, 'Can\'t get a value by key' + key);
  });
}

export function objectStorePut(store, value) {
  return new Promise((resolve, reject) => {
    const request = store.put(value);
    request.onsuccess = resolveResult(resolve);
    request.onerror = rejectErrorCode(reject, 'Can\'t put a value with key ' + value.date);
  });
}
