import { emptyObject, ensureArray } from "./index.js";

export function isTextNode(vNode) {
  return vNode.text !== undefined;
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
