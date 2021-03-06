export class Append {
  constructor(
    newVNode,
    parentContext,
    isRoot: boolean,
    isAppendRoot: boolean,
    insertContext
  ) {
    this.parentContext = parentContext;
    this.newVNode = newVNode;
    this.insertContext = insertContext;
    this.isAppendRoot = isAppendRoot;
  }
}

export class AppendComponent {
  constructor(
    newVNode,
    instance,
    parentContext,
    isAppendRoot: boolean,
    insertContext
  ) {
    this.newVNode = newVNode;
    this.instance = instance;
    this.parentContext = parentContext;
    this.isAppendRoot = isAppendRoot;
    this.insertContext = insertContext;
  }
}

export class AppendClose {
  constructor(newVNode, context, childContexts, insertContext) {
    this.newVNode = newVNode;
    this.context = context;
    this.childContexts = childContexts;
    this.insertContext = insertContext;
  }
}

export class Cleanup {
  constructor(context) {
    this.context = context;
  }
}

export class Remove {
  constructor(context) {
    this.context = context;
  }
}

export class UpdateNode {
  constructor(newContext, oldContext) {
    this.newContext = newContext;
    this.oldContext = oldContext;
  }
}

export class UpdateComponent {
  constructor(context, hasChanged) {
    this.context = context;
    this.hasChanged = hasChanged;
  }
}
