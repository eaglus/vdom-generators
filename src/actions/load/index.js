import { createCommandHandler } from "./loadHandlers.js";
import { dataLoader } from "./loadGenerator.js";
import { runCallbackGenerator } from "../../lib/utils/generator.js";

export function createLoader(env) {
  const handler = createCommandHandler(env);
  return (dateFrom, dateTo, collection) => {
    return new Promise((resolve, reject) => {
      const commands = dataLoader(dateFrom, dateTo, collection, undefined);
      runCallbackGenerator(commands, handler, undefined, resolve, reject);
    });
  };
}
