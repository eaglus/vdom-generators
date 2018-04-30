import { createCommandHandler } from "./loadHandlers.js";
import { dataLoader } from "./loadGenerator.js";
import { runCallbackGenerator } from "../../lib/utils/generator.js";

export function createLoader(env) {
  const handler = createCommandHandler(env);
  return (dateFrom, dateTo, collection) => {
    let isCanceled = false;
    let cancelHandlers = [];
    const cancelToken = {
      cancel() {
        isCanceled = true;
        const handlers = cancelHandlers;
        cancelHandlers = [];
        handlers.forEach(handler => handler());
      },

      isCanceled() {
        return isCanceled;
      },

      addCancelHandler(handler) {
        cancelHandlers.push(handler);
      }
    };
    const result = new Promise((resolve, reject) => {
      const commands = dataLoader(dateFrom, dateTo, collection, undefined);
      runCallbackGenerator(
        commands,
        handler,
        undefined,
        resolve,
        reject,
        cancelToken
      );
    });

    return {
      cancelToken,
      result
    };
  };
}
