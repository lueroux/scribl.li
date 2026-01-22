declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var __Scriblli_util_remember: Map<string, any>;
}

export function remember<T>(name: string, getValue: () => T): T {
  const thusly = globalThis;

  if (!thusly.__Scriblli_util_remember) {
    thusly.__Scriblli_util_remember = new Map();
  }

  if (!thusly.__Scriblli_util_remember.has(name)) {
    thusly.__Scriblli_util_remember.set(name, getValue());
  }

  return thusly.__Scriblli_util_remember.get(name);
}
