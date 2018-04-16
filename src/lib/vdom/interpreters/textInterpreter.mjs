import { Append, AppendClose, AppendComponent } from "../diff/commands.mjs";
import { diff } from "../diff/diff.mjs";
import { attributesAsText, normalizeProps, isTextNode } from "../utils.mjs";

function getIndentString(indentLevel) {
  let result = "";
  for (let i = 0; i !== indentLevel * 2; i++) {
    result += " ";
  }
  return result;
}

export function buildText(newVNode) {
  const commands = diff(newVNode, {});
  let indentLevel = 0;
  let next = commands.next();
  let result = "";
  let isFirst = true;
  while (!next.done) {
    const command = next.value;
    next = commands.next();

    if (command instanceof Append) {
      const { tagOrComponent: tag, text, normalizedProps } = command.newVNode;
      const indent = getIndentString(indentLevel);
      if (isTextNode(command.newVNode)) {
        result += "\n" + indent + text;
      } else {
        const attrsText = attributesAsText(normalizedProps.attributes);
        const tagStart = tag + (attrsText ? " " : "") + attrsText;
        const cr = isFirst ? "" : "\n";
        isFirst = false;
        result += `${cr}${indent}<${tagStart}>`;
        indentLevel++;
      }
    } else if (command instanceof AppendClose) {
      const { tagOrComponent: tag, isComponent } = command.newVNode;
      if (!isComponent) {
        indentLevel--;
        const indent = getIndentString(indentLevel);
        result += `\n${indent}</${tag}>`;
      }
    } else if (command instanceof AppendComponent) {
    } else {
      throw new Error("Bad command for buildText");
    }
  }
  return result;
}

export function getTextEnv() {
  return {
    normalizeProps: normalizeProps(true)
  };
}
