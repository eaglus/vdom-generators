import { Append, AppendClose, AppendComponent } from "../diff/commands.js";
import { diff } from "../diff/diff.js";
import {
  attributesAsText,
  normalizeProps,
  isTextNode
} from "../../utils/vdom.js";

function getIndentString(indentLevel) {
  let result = "";
  for (let i = 0; i !== indentLevel * 2; i++) {
    result += " ";
  }
  return result;
}

function getTextEnv() {
  return {
    normalizeProps: normalizeProps(true)
  };
}

export function buildText(newVNode) {
  const env = getTextEnv();
  const commands = diff(newVNode, {}, {});
  let indentLevel = 0;
  let next = commands.next();
  let result = "";
  let isFirst = true;
  let currentContext = {};
  while (!next.done) {
    const command = next.value;
    next = commands.next(currentContext);

    if (command instanceof Append) {
      const { tagOrComponent: tag, text, normalizedProps } = command.newVNode;
      const indent = getIndentString(indentLevel);
      if (isTextNode(command.newVNode)) {
        result += "\n" + indent + text;
      } else {
        const attrsText = attributesAsText(normalizedProps(env).attributes);
        const tagStart = tag + (attrsText ? " " : "") + attrsText;
        const cr = isFirst ? "" : "\n";
        isFirst = false;
        result += `${cr}${indent}<${tagStart}>`;
        indentLevel++;
      }

      currentContext = {
        vNode: command.newVNode
      };
    } else if (command instanceof AppendClose) {
      const { context, newVNode, childContexts } = command;
      const { instance } = context;
      const { tagOrComponent: tag, isComponent } = newVNode;
      if (!isComponent) {
        indentLevel--;
        const indent = getIndentString(indentLevel);
        result += `\n${indent}</${tag}>`;
      }

      currentContext = {
        instance,
        newVNode,
        childContexts
      };
    } else if (command instanceof AppendComponent) {
      const { newVNode, instance } = command;
      currentContext = {
        vNode: newVNode,
        instance
      };
    } else {
      throw new Error("Bad command for buildText");
    }
  }
  return result;
}
