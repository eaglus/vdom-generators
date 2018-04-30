import { CanceledException } from "./index.js";

export function runCallbackGenerator(
  commands,
  handler,
  startValue,
  resultCallback,
  errorCallback,
  cancelToken
) {
  if (cancelToken && cancelToken.isCanceled()) {
    errorCallback(new CanceledException());
  }

  const next = commands.next(startValue);
  if (next.done) {
    resultCallback(next.value);
  } else {
    handler(
      next.value,
      result => {
        runCallbackGenerator(
          commands,
          handler,
          result,
          resultCallback,
          errorCallback,
          cancelToken
        );
      },
      errorCallback,
      cancelToken
    );
  }
}
