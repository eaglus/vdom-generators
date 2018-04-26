import { runPromisedGenerator, runCallbackGenerator } from "../generator.js";

describe("generator", () => {
  function* generatorSample(start) {
    let res = yield { id: 1, result: start };
    res = yield { id: 2, result: res };
    res = yield { id: 3, result: res };
    res = yield { id: 4, result: res };
    return yield { id: 5, result: res };
  }

  const promiseIds = [3, 4];

  test("runPromisedGenerator", done => {
    const handler = command => {
      return promiseIds.includes(command.id)
        ? new Promise(resolve => setTimeout(resolve(command.id), 10))
        : command.id;
    };

    const result = runPromisedGenerator(generatorSample(), handler, null);
    result.then(v => {
      expect(v).toBe(5);
      done();
    });
  });

  test("runCallbackGenerator", done => {
    const handler = (command, callback) => {
      if (promiseIds.includes(command.id)) {
        callback(command.id);
      } else {
        setTimeout(() => {
          callback(command.id);
        }, 10);
      }
    };

    runCallbackGenerator(
      generatorSample(),
      handler,
      null,
      v => {
        expect(v).toBe(5);
        done();
      },
      done
    );
  });
});
