import { runPromisedGenerator } from "../generator.js";

describe("generator", () => {
  it("runGeneratorCommands", done => {
    function* generatorSample(start) {
      let res = yield { id: 1, result: start };
      res = yield { id: 2, results: res };
      res = yield { id: 3, results: res };
      res = yield { id: 4, results: res };
      return yield { id: 5, results: res };
    }

    const promiseIds = [3, 4];
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
});
