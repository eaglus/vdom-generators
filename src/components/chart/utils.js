export const restoreAfterRun = (context, this_) => fn => {
  return function() {
    context.save();
    const result = fn.apply(this_, arguments);
    context.restore();
    return result;
  };
};
