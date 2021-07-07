import { Rect } from "../interface";

export function mergeRect(rects: Array<Rect>) {}

export function intersectRect(r1: Rect, r2: Rect) {
  const rw = r1.width;
  const rh = r1.height;
  const tw = r2.width;
  const th = r2.height;
  const rx = r1.x;
  const ry = r1.y;
  const tx = r2.x;
  const ty = r2.y;
  return (
    (rw < rx || rw > tx) &&
    (rh < ry || rh > ty) &&
    (tw < tx || tw > rx) &&
    (th < ty || th > ry)
  );
}

export function expandRect(rect: Rect, size: number): Rect {
  const { x, y, width, height } = rect;
  return {
    x: x - size,
    y: y - size,
    width: width + size,
    height: height + size,
  };
}
