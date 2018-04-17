export class Component {
  render() {
    return null;
  }

  //componentDidMount() {}
  //componentDidUpdate() {}

  shouldComponentUpdate(newProps, newChildren) {
    return true;
  }
}

export function isStatefulComponent(componentFn) {
  return componentFn.prototype instanceof Component;
}

export function componentNeedsCleanup(componentFn) {
  const proto = componentFn.prototype;
  return isStatefulComponent(componentFn) && proto.componentWillUnmount;
}
