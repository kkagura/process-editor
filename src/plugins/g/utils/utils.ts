export function error(message) {
  throw new Error(message);
}

export function setStyle(
  el: HTMLElement,
  style: Record<string, string | number>
) {
  Object.assign(el.style, style);
}

export function isDef(v: any): boolean {
  return v !== undefined && v !== null;
}

export function shadowClone(v: Object): Object {
  return { ...v };
}

export function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function contains(root: Node, n: Node) {
  let node = n;
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
}
