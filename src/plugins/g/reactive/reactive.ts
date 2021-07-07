interface ReactiveTarget {
  __Raw?: any;
  __isReactive?: boolean;
}

const proxyMap = new WeakMap<ReactiveTarget, any>();

function toRaw<T>(obj: T): T {
  return (obj && toRaw((obj as ReactiveTarget).__Raw)) || obj;
}

function isReactive(obj): boolean {
  return obj && (obj as ReactiveTarget).__isReactive;
}

export function reactive<T extends object>(
  obj: T,
  callback: (
    key?: string | number | symbol,
    oldValue?: any,
    newValue?: any
  ) => any
): T {
  if (proxyMap.has(obj)) {
    return proxyMap.get(obj);
  }
  const p = new Proxy(obj, {
    get(target, property, receiver) {
      if (property === "__isReactive") {
        return true;
      }
      if (property === "__raw" && receiver === proxyMap.get(obj)) {
        return obj;
      }
      const value = Reflect.get(target, property, receiver);
      if ("__proto__" === property) {
        return value;
      }
      if (value !== null && typeof value === "object") {
        return reactive(value, callback);
      }
      return value;
    },
    set(target, property, value, receiver) {
      if (property === "__isReactive") {
        return true;
      }
      if (isReactive(value)) {
        value = toRaw(value);
      }
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      if (hasChanged(value, oldValue)) {
        callback(property, oldValue, value);
      }
      return result;
    },
    deleteProperty(target, property) {
      const oldValue = target[property];
      const res = Reflect.deleteProperty(target, property);
      callback(property, oldValue, undefined);
      return res;
    },
  });
  proxyMap.set(obj, p);
  return p;
}

export function reactiveKey(
  obj: object,
  callback: (
    key?: string | number | symbol,
    oldValue?: any,
    newValue?: any
  ) => any,
  key: string | number | symbol
) {
  let value = obj[key];
  Object.defineProperty(obj, key, {
    get() {
      return value;
    },
    set(v) {
      const old = obj[key];
      if (hasChanged(v, old)) {
        value = v;
        callback(key, old, v);
      }
    },
  });
}

function hasChanged(value, oldValue) {
  return value !== oldValue && (value === value || oldValue === oldValue);
}
