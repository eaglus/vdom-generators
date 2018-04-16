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

export function arePropsEqual(vNode1, vNode2) {
  return vNode1 === vNode2;
}

export function isEmptyObject(obj) {
  return !obj || Object.keys(obj).length === 0;
}

export function isTextNode(vNode) {
  return vNode.text !== undefined;
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
        remove.push(oldProp);
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

export function setAttributes(element, attributes) {
  for (let key of Object.keys(attributes)) {
    const attr = attributes[key];
    element.setAttribute(key, attr);
  }
}

export function removeAttributes(element, attributes) {
  for (let key of attributes) {
    element.removeAttribute(key);
  }
}

export function setProps(element, props) {
  for (let key of Object.keys(props)) {
    element[key] = props[key];
  }
}

export function removeProps(element, props) {
  for (let key of props) {
    delete element[key];
  }
}

function styleAsText(style) {
  const keys = Object.keys(style);
  return keys.map(key => key + ": " + style[key] + ";").join(" ");
}

export function attributesAsText(attributes) {
  const keys = Object.keys(attributes);
  return keys.map(key => `${key}="${attributes[key]}"`).join(" ");
}

const propsAsNodeProps = {
  value: true
};

export const normalizeProps = forText => props => {
  const nodeProps = forText ? emptyObject : propsAsNodeProps;
  const keys = Object.keys(props);
  const attributes = {};
  const elementProps = {};
  const events = {};
  let style;
  keys.forEach(key => {
    const prop = props[key];
    if (key.startsWith("on")) {
      const eventName = key.slice(2).toLowerCase();
      events[eventName] = prop;
    } else if (nodeProps.hasOwnProperty(key)) {
      elementProps[key] = prop;
    } else if (key === "style") {
      if (forText) {
        attributes[key] = styleAsText(prop);
      } else {
        style = prop;
      }
    } else {
      attributes[key] = prop;
    }
  });

  return {
    attributes,
    props: elementProps,
    events,
    style
  };
};

export const bemClass = block => (element, modifier) => {
  const modifiers = ensureArray(modifier);
  const base = `${block}-${element}`;
  const modClasses = modifiers
    .map(mod => (mod ? `${base}_${mod}` : ""))
    .filter(cls => !!cls);
  return [base, ...modClasses].join(" ");
};

export const bemClassProps = block => (element, modifier) => {
  return {
    class: bemClass(block)(element, modifier)
  };
};
