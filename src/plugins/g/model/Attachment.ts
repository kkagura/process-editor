import {
  BEFORE_ELEMENT_REMOVE,
  ELEMENT_REMOVED,
  HOST_PROP_CHANGED,
  PROP_CHANGED,
} from "../constant";
import { Point, Rect } from "../interface";
import EventEmitter from "../utils/EventEmitter";
import Base from "./Base";
import Element from "./Element";

export type AttFlag = "resize" | "port" | "bezier" | "label";
export default abstract class Attachment extends Base {
  host: Element;
  rect: Rect;
  visible: boolean = false;
  abstract attFlag: AttFlag;
  abstract render(ctx: CanvasRenderingContext2D);
  getRect(): Rect {
    return this.rect;
  }
  attacheTo(el: Element) {
    this.host = el;
    this.host.addListener(PROP_CHANGED, this.onHostPropChanged, this);
    this.host.addListener(BEFORE_ELEMENT_REMOVE, this.onHostRemoved, this);
  }
  onHostPropChanged(...args) {
    this.emitListener(HOST_PROP_CHANGED, ...args);
  }
  onHostRemoved() {
    this.destroy();
  }
  hit(point: Point, t: number = 0): boolean {
    let rect = this.getRect();
    if (!rect) {
      return false;
    }
    if (!this.isVisible()) {
      return false;
    }
    const { x, y, width, height } = rect;
    return (
      point.x >= x - t &&
      point.y >= y - t &&
      point.x <= x + width + t &&
      point.y <= y + height + t
    );
  }
  setVisible(bool: boolean) {
    const old = this.isVisible();
    if (old !== bool) {
      this.visible = bool;
      this.host.forceUpdate();
    }
  }
  isVisible() {
    return this.visible;
  }
  getCursor() {
    return "default";
  }
  getCenterLocation(): Point {
    const { x, y, width, height } = this.getRect();
    return {
      x: x + width / 2,
      y: y + height / 2,
    };
  }
  destroy() {
    this.clearListeners();
    this.host.removeListener(PROP_CHANGED, this.onHostPropChanged, this);
  }
  forceUpdate() {
    this.host.forceUpdate();
  }
  emitPropChangeListener(key, oldValue, newValue) {
    super.emitPropChangeListener(key, oldValue, newValue);
    if (this.isVisible()) {
      this.forceUpdate();
    }
  }
}
