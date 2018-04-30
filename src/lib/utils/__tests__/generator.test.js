import { runCallbackGenerator } from "../generator.js";

describe("generator", () => {
  function* generatorSample(start) {
    let res = yield { id: 1, result: start };
    res = yield { id: 2, result: res };
    res = yield { id: 3, result: res };
    res = yield { id: 4, result: res };
    return yield { id: 5, result: res };
  }

  const promiseIds = [3, 4];

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
