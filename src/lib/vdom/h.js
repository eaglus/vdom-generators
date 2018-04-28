import { emptyObject, ensureArray } from "../utils/index.js";

const emptyNormProps = () => emptyObject;

function isStringOrNumber(v) {
  return typeof v === "string" || typeof v === "number";
}

function isValidTag(tagOrComponent) {
  return (
    typeof tagOrComponent !== "string" || typeof tagOrComponent !== "function"
  );
}
export function h(tagOrComponent, props, children) {
  const argsLn = arguments.length;
  if (argsLn === 1 && !tagOrComponent) {
    return false;
  } else if ((argsLn === 2 || argsLn === 3) && isValidTag(tagOrComponent)) {
    if (argsLn === 2) {
      if (Array.isArray(props) || isStringOrNumber(props)) {
        children = props;
        props = emptyObject;
      } else {
        children = [];
      }
    }

    if (typeof props !== "object") {
      throw new Error("Bad node");
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
        if (normalizedProps) {
          return normalizedProps;
        } else if (isComponent) {
          normalizedProps = props;
          return props;
        } else {
          normalizedProps = env.normalizeProps(props);
          return normalizedProps;
        }
      },
      children,
      isComponent
    };
  } else {
    throw new Error("Bad node");
  }
}
