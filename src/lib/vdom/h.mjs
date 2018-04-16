import { emptyObject, ensureArray } from "../utils.mjs";

const emptyNormProps = env => emptyObject;

function isStringOrNumber(v) {
  return typeof v === "string" || typeof v === "number";
}
export function h(tagOrComponent, props, children) {
  const argsLn = arguments.length;
  if (argsLn === 2) {
    if (Array.isArray(props) || isStringOrNumber(props)) {
      children = props;
      props = emptyObject;
    } else {
      children = [];
    }
  }

  if (isStringOrNumber(children)) {
    children = [{ text: String(children), normalizedProps: emptyNormProps }];
  } else {
    children = ensureArray(children);
  }

  const isComponent = typeof tagOrComponent === "function";

  let normalizedProps;
  return {
    tagOrComponent,
    props,
    normalizedProps: env => {
      if (isComponent) {
        return props;
      } else if (normalizedProps) {
        return normalizedProps;
      } else {
        normalizedProps = env.normalizeProps(props);
        return normalizedProps;
      }
    },
    children,
    isComponent
  };
}
