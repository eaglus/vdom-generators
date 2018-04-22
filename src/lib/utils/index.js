export const emptyObject = {};
export const emptyArray = [];

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertNotImplemented() {
  throw new Error("Not implemented");
}

export function ensureArray(v) {
  return Array.isArray(v) ? v : [v];
}

export function isEmptyObject(obj) {
  return !obj || Object.keys(obj).length === 0;
}

export function omit(obj, key) {
  const keys = Object.keys(obj).filter(k => k !== key);
  return keys.reduce((res, k) => {
    return {
      ...res,
      [k]: obj[k]
    };
  }, {});
}

export function diffProps(oldProps, newProps) {
  if (oldProps === newProps) {
    return null;
  } else {
    const oldKeys = Object.keys(oldProps || emptyObject);
    const newKeys = Object.keys(newProps || emptyObject);
    const set = {};
    const add = {};
    const remove = [];
    let changesCnt = 0;

    for (let oldKey of oldKeys) {
      const oldProp = oldProps[oldKey];
      if (!newProps || !newProps.hasOwnProperty(oldKey)) {
        changesCnt++;
        remove.push(oldKey);
      } else {
        const newProp = newProps[oldKey];
        if (newProp !== oldProp) {
          changesCnt++;
          set[oldKey] = newProp;
        }
      }
    }

    for (let newKey of newKeys) {
      const newProp = newProps[newKey];
      if (!oldProps || !oldProps.hasOwnProperty(newKey)) {
        changesCnt++;
        add[newKey] = newProp;
      }
    }

    return changesCnt > 0 ? { set, add, remove } : null;
  }
}

export function compose(fn1, fn2) {
  return v => fn1(fn2(v));
}

export function lowerBound(arr, value, compareFn) {
  let l = 0;
  let h = arr.length;
  while (l !== h) {
    const m = Math.floor((l + h) / 2);
    if (compareFn(arr[m], value) >= 0) {
      h = m;
    } else {
      l = m + 1;
    }
  }
  return l;
}

export function upperBound(arr, value, compareFn) {
  let l = -1;
  let h = arr.length - 1;
  while (l !== h) {
    const m = Math.ceil((l + h) / 2);
    if (compareFn(arr[m], value) <= 0) {
      l = m;
    } else {
      h = m - 1;
    }
  }
  return l;
}
