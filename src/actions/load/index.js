import { createCommandHandler } from "./loadHandlers";
import { dataLoader } from "./loadGenerator";
import { runCallbackGenerator } from "../../lib/utils/generator";

export function createLoader(env) {
  const handler = createCommandHandler(env);
  return (dateFrom, dateTo, collection) => {
    return new Promise((resolve, reject) => {
      const commands = dataLoader(dateFrom, dateTo, collection, undefined);
      runCallbackGenerator(commands, handler, undefined, resolve, reject);
    });
  };
}
