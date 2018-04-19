export function runPromisedGenerator(commands, handler, startValue) {
  let next = commands.next(startValue);
  while (!next.done) {
    const result = handler(next.value);
    if (result instanceof Promise) {
      return result.then(value => runPromisedGenerator(commands, handler, value));
    } else {
      next = commands.next(result);
    }
  }
  return Promise.resolve(next.value);
}