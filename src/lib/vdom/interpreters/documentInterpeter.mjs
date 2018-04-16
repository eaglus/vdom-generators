import {
  Append,
  AppendComponent,
  AppendClose,
  Cleanup,
  Remove,
  UpdateNode,
  UpdateComponent
} from "../diff/commands.mjs";
import { diff } from "../diff/diff.mjs";
import {
  normalizeProps,
  isEmptyObject,
  assertNotImplemented,
  diffProps,
  emptyObject,
  emptyArray,
  isTextNode,
  omit,
  setAttributes,
  removeAttributes,
  setProps,
  removeProps
} from "../../utils.mjs";
import { componentNeedsCleanup } from "../component.mjs";

let contextId = 0;
function createContextId() {
  contextId++;
  return contextId;
}

function getDocumentEnv() {
  return {
    normalizeProps: normalizeProps(false)
  };
}

function getDomEvents(events) {
  const { mount, unmount, ...domEvents } = events || emptyObject;
  return domEvents;
}

function needsCleanup(vNode, rootContext) {
  const { normalizedProps, isComponent, tagOrComponent } = vNode;
  return (
    !isEmptyObject(normalizedProps(rootContext.env).events) ||
    (isComponent && componentNeedsCleanup(tagOrComponent))
  );
}

function getTopElements(context) {
  const { vNode, element, childContexts } = context;
  if (vNode.isComponent) {
    return childContexts.reduce(
      (elements, childContext) => elements.concat(getTopElements(childContext)),
      []
    );
  } else {
    return [element];
  }
}

function enqueue(queue, action) {
  return action ? (queue || emptyArray).concat(action) : queue;
}

function updateRootContext(rootContext, addEvents, removeEvents, queueAction) {
  const queue = enqueue(rootContext.queue, queueAction);
  const addEventNames = Object.keys(addEvents || emptyObject);
  const removeEventNames = removeEvents || emptyArray;

  let events = rootContext.events;
  if (removeEventNames.length && events) {
    for (let eventName of removeEventNames) {
      const eventCnt = events[eventName];

      if (eventCnt > 1) {
        events = {
          ...events,
          [eventName]: eventCnt - 1
        };
      } else {
        events = omit(events, eventName);
      }
    }
  }

  if (addEventNames.length) {
    for (let eventName of addEventNames) {
      const eventCnt = events && events[eventName];
      events = events
        ? {
          ...events,
          [eventName]: eventCnt ? eventCnt + 1 : 1
        }
        : { [eventName]: 1 };
    }
  }

  if (events !== rootContext.events || queue !== rootContext.queue) {
    return {
      ...rootContext,
      events,
      queue
    };
  } else {
    return rootContext;
  }
}

function updateContextById(context, id, rootContext, mutable) {
  const contextById = rootContext.contextById || emptyObject;
  const newContextById = mutable ? contextById : { ...contextById };
  if (context) {
    newContextById[id] = context;
  } else {
    delete newContextById[id];
  }
  if (mutable) {
    rootContext.contextById = newContextById;
  } else {
    return {
      ...rootContext,
      contextById: newContextById
    }
  }
}

function cloneContextById(rootContext) {
  return {
    ...rootContext,
    contextById: {
      ...rootContext.contextById
    }
  };
}

function setInstanceProps(newContext, requestUpdate) {
  const { instance } = newContext;
  if (instance) {
    instance.setState = state => {
      instance.state = {
        ...instance.state,
        ...state
      };
      requestUpdate(newContext);
    };
  }
}
///////////

function handleAppend(command, rootContext) {
  const { newVNode, parentContext, isAppendRoot, insertContext } = command;
  const normalizedProps = newVNode.normalizedProps(rootContext.env);
  const { tagOrComponent: tag, text } = newVNode;
  const { props, attributes, events, style } = normalizedProps;

  const { mount: mountEvent } = events || emptyObject;

  const { element: parentElement } = parentContext;

  const isText = isTextNode(newVNode);
  const element = isText
    ? document.createTextNode(text)
    : document.createElement(tag);

  if (isText) {
    element.nodeValue = text;
  } else {
    setAttributes(element, attributes);
    setProps(element, props);
    if (style) {
      setProps(element.style, style);
    }
  }

  const fragment = isAppendRoot ? document.createDocumentFragment() : null;

  if (fragment) {
    fragment.append(element);
  } else if (insertContext) {
    const { element: prevSibling } = insertContext;
    if (prevSibling === "prepend") {
      if (parentElement.firstChild) {
        parentElement.insertBefore(element, parentElement.firstChild);
      } else {
        parentElement.append(element);
      }
    } else {
      parentElement.insertBefore(element, prevSibling);
      parentElement.insertBefore(prevSibling, element);
    }
  } else {
    parentElement.append(element);
  }

  if (isText) {
    return {
      context: { element, vNode: newVNode },
      rootContext
    };
  } else {
    const queueAction = mountEvent && (() => mountEvent(element));
    const domEvents = getDomEvents(events);
    const newRootContext = updateRootContext(
      rootContext,
      domEvents,
      null,
      queueAction
    );

    if (!isEmptyObject(domEvents)) {
      element.rootContext = newRootContext;
      element.virtualEvents = domEvents;
    }

    return {
      context: {
        element,
        vNode: newVNode,
        fragment,
        parentElement,
        id: createContextId(),
        parentId: parentContext.id
      },
      rootContext: newRootContext
    };
  }
}

function handleAppendComponent(command, rootContext) {
  const { newVNode, instance, parentContext, isAppendRoot } = command;
  const fragment = isAppendRoot ? document.createDocumentFragment() : null;
  const element = fragment || parentContext.element;
  const context = {
    vNode: newVNode,
    id: createContextId(),
    parentId: parentContext.id,
    instance,
    element,
    fragment,
    parentElement: parentContext.element
  };

  let queueAction;
  if (instance) {
    queueAction =
      instance.componentDidMount && (() => instance.componentDidMount());
  }

  return {
    context,
    rootContext: updateRootContext(rootContext, null, null, queueAction)
  };
}

function handleAppendClose(command, rootContext) {
  const { context, childContexts, insertContext } = command;
  const { vNode, fragment, parentElement, parentContext, instance, id, parentId } = context;
  const { isComponent } = vNode;
  const childrenNeedCleanup =
    childContexts &&
    childContexts.reduce(
      (result, ctx) =>
        result || ctx.selfNeedsCleanup || ctx.childrenNeedCleanup,
      false
    );

  if (fragment) {
    console.log("Append fragment", fragment);
    if (insertContext) {
      const { element: prevSibling } = insertContext;
      if (prevSibling === "prepend") {
        if (parentElement.firstChild) {
          parentElement.insertBefore(fragment, parentElement.firstChild);
        } else {
          parentElement.append(fragment);
        }
      } else {
        const first = fragment.firstChild;
        if (first) {
          parentElement.insertBefore(fragment, prevSibling);
          parentElement.insertBefore(prevSibling, first);
        }
      }
    } else {
      parentElement.append(fragment);
    }
  }

  const newContext = {
    element: isComponent ? parentElement : context.element,
    instance,
    vNode,
    parentContext,
    childContexts,
    selfNeedsCleanup: needsCleanup(vNode, rootContext),
    childrenNeedCleanup,
    id,
    parentId
  };

  rootContext = updateContextById(newContext, id, rootContext);
  setInstanceProps(newContext, rootContext.requestUpdate);

  return {
    context: newContext,
    rootContext
  };
}

function handleCleanup(command, rootContext) {
  const { vNode, element, id } = command.context;
  const normalizedProps = vNode.normalizedProps(rootContext.env);
  const { events } = normalizedProps;
  const { unmount } = events || emptyObject;
  const { instance } = vNode;

  let queueAction;
  if (vNode.isComponent) {
    if (instance) {
      delete instance.setState;
      queueAction =
        instance.componentWillUnmount &&
        (() => {
          instance.componentWillUnmount();
        });
    }
  } else {
    delete element.rootContext;
    delete element.virtualEvents;
    if (unmount) {
      queueAction = () => unmount(element);
    }
  }

  if (id) {
    rootContext = updateContextById(null, id, rootContext);
  }
  console.log("cleanup node", vNode);
  return {
    context: command.context,
    rootContext: updateRootContext(
      rootContext,
      null,
      getDomEvents(events),
      queueAction
    )
  };
}

function handleRemove(command, rootContext) {
  const topElements = getTopElements(command.context);
  const firstElement = topElements.length > 0 ? topElements[0] : null;
  const prevSibling = firstElement ? firstElement.previousSibling : null;

  for (let element of topElements) {
    console.log("remove subtree at", element);
    element.remove();
  }

  const insertContext = {
    element: prevSibling || "prepend"
  };

  return {
    context: insertContext,
    rootContext
  };
}

function handleUpdateNode(command, rootContext) {
  const { newVNode, context } = command;
  const { vNode: oldVNode } = context;
  let hasUpdates;
  let newRootContext;
  if (isTextNode(newVNode)) {
    hasUpdates = newVNode.text !== oldVNode.text;
    if (hasUpdates) {
      context.element.nodeValue = newVNode.text;
    }
    newRootContext = rootContext;
  } else {
    const normalizedProps = newVNode.normalizedProps(rootContext.env);
    const { props, attributes, events, style } = normalizedProps;

    const { vNode, element } = context;
    const oldProps = vNode.normalizedProps(rootContext.env);

    const attrsDiff = diffProps(oldProps.attributes, attributes);
    if (attrsDiff) {
      setAttributes(element, attrsDiff.set);
      setAttributes(element, attrsDiff.add);
      removeAttributes(element, attrsDiff.remove);
    }

    const propsDiff = diffProps(oldProps.props, props);
    if (propsDiff) {
      setProps(element, propsDiff.set);
      setProps(element, propsDiff.add);
      removeProps(element, propsDiff.remove);
    }

    const styleDiff = diffProps(oldProps.style, style);
    if (styleDiff) {
      setProps(element.style, styleDiff.set);
      setProps(element.style, styleDiff.add);
      removeProps(element.style, styleDiff.remove);
    }

    const oldEventsEmpty = isEmptyObject(oldProps.events);
    const newEventsEmpty = isEmptyObject(events);
    const eventsDiff = oldEventsEmpty !== newEventsEmpty;
    if (eventsDiff) {
      if (oldEventsEmpty) {
        element.virtualEvents = events;
      } else {
        delete element.virtualEvents;
      }
    }
    hasUpdates = attrsDiff || propsDiff || styleDiff || eventsDiff;

    const oldDomEvents = getDomEvents(oldProps.events);
    const domEvents = getDomEvents(events);
    const diffEvents = diffProps(oldDomEvents, domEvents);

    if (diffEvents) {
      newRootContext = updateRootContext(
        rootContext,
        diffEvents.add,
        diffEvents.remove,
        null
      );

      if (!isEmptyObject(domEvents)) {
        element.rootContext = newRootContext;
        element.virtualEvents = domEvents;
      } else {
        delete element.rootContext;
        delete element.virtualEvents;
      }
    } else {
      newRootContext = rootContext;
    }

    newRootContext = updateContextById(context, context.id, newRootContext);
  }

  return {
    context,
    rootContext: newRootContext
  };
}

function handleUpdateComponent(command, rootContext) {
  const { context } = command;
  const { instance } = context;
  const queueAction =
    instance &&
    instance.componentDidUpdate &&
    (() => instance.componentDidUpdate());

  setInstanceProps(context, rootContext.requestUpdate);

  rootContext = updateContextById(context, context.id, rootContext);
  return {
    context: command.context,
    rootContext: updateRootContext(rootContext, null, null, queueAction)
  };
}

function domEventHandler(event) {
  let target = event.target;
  let handlerFound = false;
  while (target && !handlerFound) {
    const { virtualEvents, rootContext } = target;
    if (virtualEvents && rootContext) {
      handlerFound = virtualEvents[event.type];
      if (handlerFound) {
        const action =
          typeof handlerFound === "function"
            ? handlerFound(event)
            : handlerFound;
        if (action) {
          rootContext.dispatch(action);
        }
      }
    }
    target = target.parentElement;
  }
}

export function applyDiff(newVNode, oldContext, rootContext, dispatch) {
  rootContext = {
    ...rootContext,
    dispatch,
    env: getDocumentEnv()
  };

  const commands = diff(newVNode, oldContext, rootContext, rootContext);

  const { events } = rootContext;
  let next = commands.next();

  while (!next.done) {
    const command = next.value;

    let handler, context;
    if (command instanceof Append) {
      handler = handleAppend;
    } else if (command instanceof AppendComponent) {
      handler = handleAppendComponent;
    } else if (command instanceof AppendClose) {
      handler = handleAppendClose;
    } else if (command instanceof Cleanup) {
      handler = handleCleanup;
    } else if (command instanceof Remove) {
      handler = handleRemove;
    } else if (command instanceof UpdateNode) {
      handler = handleUpdateNode;
    } else if (command instanceof UpdateComponent) {
      handler = handleUpdateComponent;
    } else {
      assertNotImplemented();
      handler = null;
    }

    ({ context, rootContext } = handler(command, rootContext));
    next = commands.next(context);
  }

  const eventsDiff = diffProps(events, rootContext.events);
  if (eventsDiff) {
    const { element } = rootContext;
    if (eventsDiff.remove) {
      for (let eventName of eventsDiff.remove) {
        element.removeEventListener(eventName, domEventHandler(dispatch), true);
      }
    }

    if (eventsDiff.add) {
      for (let eventName of Object.keys(eventsDiff.add)) {
        element.addEventListener(eventName, domEventHandler, true);
      }
    }
  }

  return {
    context: next.value,
    rootContext
  };
}

function updateTopParent(innerContext, oldInnerContext, rootContext) {
  let { parentId } = oldInnerContext;
  rootContext = cloneContextById(rootContext);
  while (parentId) {
    const parentContext = rootContext.contextById[parentId];
    const childContexts = parentContext.childContexts.map(
      context => (context === oldInnerContext ? innerContext : context)
    );

    const newParentContext = {
      ...parentContext,
      childContexts
    };
    setInstanceProps(newParentContext, rootContext.requestUpdate);
    updateContextById(newParentContext, parentId, rootContext, true);

    oldInnerContext = parentContext;
    innerContext = newParentContext;
    parentId = oldInnerContext.parentId;
  }
  return { innerContext, rootContext };
}

function execQueue(queue, dispatch) {
  if (queue) {
    for (let actionFn of queue) {
      const action = actionFn();
      if (action) {
        dispatch(action);
      }
    }
  }
}

// export function makeUpdater(rootElement, dispatch) {
//   let mountContext = null;
//   let rootContext = {
//   };

//   const requestUpdate = innerContext => {
//     const { vNode } = innerContext;
//     const newVNode = {
//       ...vNode
//     };

//     const oldInnerContext = innerContext;
//     ({ context: innerContext, rootContext } = applyDiff(
//       newVNode,
//       innerContext,
//       rootContext,
//       dispatch
//     ));

//     ({ innerContext: mountContext, rootContext } = updateTopParent(
//       innerContext,
//       oldInnerContext,
//       rootContext
//     ));

//     const queue = rootContext.queue;
//     rootContext = omit(rootContext, "queue");
//     execQueue(queue, dispatch);
//   };

//   rootContext.element = rootElement;
//   rootContext.requestUpdate = requestUpdate;

//   return newVNode => {
//     ({ context: mountContext, rootContext } = applyDiff(
//       newVNode,
//       mountContext,
//       rootContext,
//       dispatch
//     ));

//     const queue = rootContext.queue;
//     rootContext = omit(rootContext, "queue");
//     execQueue(queue, dispatch);
//   };
// }

export function makeUpdater(rootElement, dispatch) {
  let mountContext = null;
  let rootContext = {
    element: rootElement,
    requestUpdate: innerContext => {
      const { vNode } = mountContext;
      const topNodeCloned = {
        ...vNode
      };
      if (topNodeCloned.children) {
        topNodeCloned.children = topNodeCloned.children.map(child => ({
          ...child
        }));
      }

      ({ context: mountContext, rootContext } = applyDiff(
        topNodeCloned,
        mountContext,
        rootContext,
        dispatch
      ));

      const queue = rootContext.queue;
      rootContext = omit(rootContext, "queue");
      execQueue(queue, dispatch);
    }
  };

  return newVNode => {
    ({ context: mountContext, rootContext } = applyDiff(
      newVNode,
      mountContext,
      rootContext,
      dispatch
    ));

    const queue = rootContext.queue;
    rootContext = omit(rootContext, "queue");
    execQueue(queue, dispatch);
  };
}