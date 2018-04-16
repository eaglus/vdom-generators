import {
  Append,
  AppendComponent,
  AppendClose,
  Cleanup,
  Remove,
  UpdateNode,
  UpdateComponent
} from "./commands.mjs";

import { isStatefulComponent } from "../component.mjs";
import {
  isTextNode,
  ensureArray,
  emptyObject,
  emptyArray
} from "../../utils.mjs";

function* append(newVNode, parentContext, isAppendRoot, insertContext) {
  if (newVNode.isComponent) {
    return yield* appendComponent(
      newVNode,
      parentContext,
      isAppendRoot,
      insertContext
    );
  } else {
    const isText = isTextNode(newVNode);
    const openContext = yield new Append(
      newVNode,
      parentContext,
      isAppendRoot && !isText,
      insertContext
    );
    if (!isText) {
      const children = newVNode.children || emptyArray;
      const ln = children.length;
      const childContexts = [];
      for (let i = 0; i !== ln; i++) {
        const childVNode = children[i];
        if (childVNode) {
          const childContext = yield* append(childVNode, openContext, false);
          childContexts.push(childContext);
        }
      }
      const closeContext = yield new AppendClose(
        newVNode,
        openContext,
        childContexts,
        insertContext
      );
      return closeContext;
    } else {
      return openContext;
    }
  }
}

function* appendComponent(
  newVNode,
  parentContext,
  isAppendRoot,
  insertContext
) {
  let markup;
  let instance;
  let componentFn = newVNode.tagOrComponent;

  if (isStatefulComponent(componentFn)) {
    instance = new componentFn(newVNode.props, newVNode.children);
    instance.props = newVNode.props;
    instance.children = newVNode.children;
    markup = instance.render();
  } else {
    markup = componentFn(newVNode.props, newVNode.children);
  }

  const openContext = yield new AppendComponent(
    newVNode,
    instance,
    parentContext,
    isAppendRoot,
    insertContext
  );

  const markupArr = ensureArray(markup);
  const ln = markupArr.length;
  const childContexts = [];

  for (let i = 0; i !== ln; i++) {
    const childVNode = markupArr[i];
    if (childVNode) {
      const childContext = yield* append(markupArr[i], openContext);
      childContexts.push(childContext);
    }
  }

  const closeContext = yield new AppendClose(
    newVNode,
    openContext,
    childContexts,
    insertContext
  );

  return closeContext;
}

function* remove(context) {
  yield* cleanup(context);
  return yield new Remove(context);
}

function* cleanup(context) {
  const { selfNeedsCleanup, childrenNeedCleanup } = context;
  if (selfNeedsCleanup || childrenNeedCleanup) {
    if (selfNeedsCleanup) {
      yield new Cleanup(context);
    }
    if (childrenNeedCleanup) {
      const { childContexts } = context;

      const ln = childContexts.length;
      for (let i = 0; i !== ln; i++) {
        yield* cleanup(childContexts[i]);
      }
    }
  }
}

export function* diff(newVNode, context, parentContext) {
  const { vNode: oldVNode } = context || emptyObject;
  const isOldFalsy = !oldVNode;
  const isNewFalsy = !newVNode;
  if (oldVNode !== newVNode && !(isOldFalsy && isNewFalsy)) {
    if (!oldVNode) {
      return yield* append(newVNode, parentContext, true);
    } else if (!newVNode) {
      return yield* remove(context);
    } else if (oldVNode.tagOrComponent !== newVNode.tagOrComponent) {
      const insertContext = yield* remove(context);
      return yield* append(newVNode, parentContext, true, insertContext);
    } else {
      const { childContexts, instance, vNode } = context;
      let newChildren;
      if (isTextNode(vNode)) {
        if (vNode.text !== newVNode.text) {
          yield new UpdateNode(newVNode, context);
          return {
            ...context,
            vNode: newVNode
          };
        } else {
          return context;
        }
      } else if (vNode.isComponent) {
        if (instance) {
          const shouldUpdate = instance.shouldComponentUpdate(
            newVNode.props,
            newVNode.children
          );
          instance.props = newVNode.props;
          instance.children = newVNode.children;
          if (shouldUpdate) {
            newChildren = ensureArray(instance.render());
          } else {
            newChildren = childContexts.map(ctx => ctx.vNode);
          }
        } else {
          newChildren = ensureArray(
            newVNode.tagOrComponent(newVNode.props, newVNode.children)
          );
        }
      } else {
        newChildren = newVNode.children;
      }

      const oldLn = childContexts.length;
      const newLn = newChildren.length;
      const maxLn = Math.max(oldLn, newLn);

      const childrenChanged =
        oldLn !== newLn ||
        newChildren.some(
          (newVNode, index) => newVNode !== childContexts[index].vNode
        );

      let updatedContext;
      if (childrenChanged) {
        let i;
        const newChildContexts = [];
        for (i = 0; i !== maxLn; i++) {
          const newChildVNode = i < newLn ? newChildren[i] : null;
          const oldChildContext = i < oldLn ? childContexts[i] : null;
          const updatedChildContext = yield* diff(
            newChildVNode,
            oldChildContext,
            context
          );
          if (updatedChildContext) {
            newChildContexts.push(updatedChildContext);
          }
        }

        updatedContext = {
          ...context,
          vNode: newVNode,
          childContexts: newChildContexts
        };
      } else {
        updatedContext = {
          ...context,
          vNode: newVNode
        };
      }
      if (vNode.isComponent) {
        yield new UpdateComponent(updatedContext);
        return updatedContext;
      } else {
        yield new UpdateNode(newVNode, context);
        return updatedContext;
      }
    }
  } else {
    return context;
  }
}
