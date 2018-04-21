import { compose } from "./index";

export function getResult(event) {
  return event.target.result;
}

function resolveResult(resolveFn) {
  return compose(resolveFn, getResult);
}

function resolveResultWithTarget(resolveFn) {
  return compose(resolveFn, ({ target }) => [target.result, target]);
}

function rejectErrorCode(rejectFn, message) {
  return compose(rejectFn, event => `${message}: ${event.target.errorCode}`);
}

export function openIndexedDB(env, dbName, version, upgradeFn) {
  return new Promise((resolve, reject) => {
    const request = env.indexedDB.open(dbName, version);
    request.onupgradeneeded = resolveResult(upgradeFn);
    request.onsuccess = resolveResult(resolve);
    request.onerror = rejectErrorCode(reject, `Error open database ${dbName}`);
  });
}

export function indexOpenCursor(index, range) {
  const request = index.openCursor(range);
  let result;
  let error;

  request.onsuccess = resolveResultWithTarget(res => {
    result = res;
  });
  request.onerror = rejectErrorCode(err => {
    error = err;
  }, `Error continue cursor`);

  return new Promise((resolve, reject) => {
    if (result) {
      resolve(result);
    } else if (error) {
      reject(error);
    } else {
      request.onsuccess = resolveResultWithTarget(resolve);
      request.onerror = rejectErrorCode(reject, `Error continue cursor`);
    }
  });
}

export function cursorContinue(cursor, request) {
  let result;
  let error;
  request.onsuccess = resolveResultWithTarget(res => {
    result = res;
  });
  request.onerror = rejectErrorCode(err => {
    error = err;
  }, `Error continue cursor`);

  cursor.continue();
  return new Promise((resolve, reject) => {
    if (result) {
      resolve(result);
    } else if (error) {
      reject(error);
    } else {
      request.onsuccess = resolveResultWithTarget(resolve);
      request.onerror = rejectErrorCode(reject, `Error continue cursor`);
    }
  });
}
