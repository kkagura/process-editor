import { ELEMENT_ADDED, ELEMENT_BOX_CHANGED, PROP_CHANGED } from "../constant";
import BaseInteraction from "../interaction/BaseInteraction";
import Selection from "../interaction/Selection";
import { ElementBoxChangeEvent, Maker, Point, Rect } from "../interface";
import { RectElement } from "../model";
import Attachement from "../model/Attachment";
import Element from "../model/Element";
import { reactive, reactiveKey } from "../reactive/reactive";
import { error, setStyle } from "../utils";
import EventEmitter, { Fn } from "../utils/EventEmitter";
import { intersectRect } from "../utils/math";
import Box from "./Box";

class Canvas extends EventEmitter {
  option: Option;
  root: HTMLCanvasElement;
  top: HTMLCanvasElement;
  container: HTMLElement;
  wraper: HTMLElement;
  box: Box = new Box();
  updateQueue: Array<Element> = [];
  pending: boolean = false;
  viewRect: Rect = reactive<Rect>(
    { x: 0, y: 0, width: 0, height: 0 },
    this.trigger.bind(this)
  );
  zoom: number = 1;
  interaction: BaseInteraction;
  selection: Selection;
  markers: Array<Maker> = [];
  constructor(option: Option) {
    super();
    this.normalizeOpts(option);
    this.option = option;
    this.init();
  }

  init() {
    const repaint = (e: ElementBoxChangeEvent) => {
      if (e.kind === ELEMENT_ADDED) {
        this.reactiveEl(e.source);
      }
      this.pushElementToUpdateQueue(e.source);
    };
    this.box.addListener(ELEMENT_BOX_CHANGED, repaint);

    this.createCanvas();
    this.interaction = new BaseInteraction(this);
    this.selection = new Selection(this);
  }

  createCanvas() {
    this.wraper = document.createElement("div");
    this.wraper.tabIndex = -1;
    this.top = document.createElement("canvas");
    this.root = document.createElement("canvas");
    const { width, height } = this.container.getBoundingClientRect();
    this.resize({ x: 0, y: 0, width, height });
    this.wraper.appendChild(this.top);
    this.wraper.appendChild(this.root);
    this.container.appendChild(this.wraper);
  }

  resize(rect: Rect) {
    const { x, y, width, height } = rect;
    this.top.width = width;
    this.top.height = height;
    setStyle(this.wraper, {
      left: x + "px",
      top: y + "px",
      width: width + "px",
      height: height + "px",
      position: "absolute",
    });
    setStyle(this.top, {
      left: x + "px",
      top: y + "px",
      width: width + "px",
      height: height + "px",
      position: "absolute",
    });
    this.root.width = width;
    this.root.height = height;
    setStyle(this.root, {
      left: x + "px",
      top: y + "px",
      width: width + "px",
      height: height + "px",
      position: "absolute",
    });
  }

  normalizeOpts(opt: Option) {
    if (typeof opt.el === "string") {
      this.container = document.querySelector(opt.el);
    } else {
      this.container = opt.el;
    }
    setStyle(this.container, {
      position: "relative",
    });
  }

  pushElementToUpdateQueue(element: Element) {
    if (!this.updateQueue.includes(element)) {
      this.updateQueue.push(element);
      this.trigger();
    }
  }

  trigger() {
    if (this.pending) {
      return;
    }
    this.pending = true;
    Promise.resolve().then(() => {
      this.repaint();
      this.updateQueue = [];
      this.pending = false;
    });
  }

  repaint() {
    this.repaintAll();
  }

  repaintPart() {}

  repaintAll() {
    const { box, root } = this;
    const ctx = root.getContext("2d");
    const elements = box.getElements();
    ctx.clearRect(0, 0, root.width, root.height);
    ctx.save();
    const { x, y } = this.getViewRect();
    ctx.translate(-x, -y);
    ctx.scale(this.zoom, this.zoom);
    elements.forEach((el) => {
      el.update(ctx);
    });
    ctx.restore();
  }

  // setZoom(zoom: number, point: Point) {
  //   const old = this.zoom;
  //   zoom = Math.max(zoom, 0.1);
  //   zoom = Math.min(zoom, 10);
  //   this.zoom = zoom;
  //   const vr = this.getViewRect();
  //   const offsetx = e.pageX - ((e.pageX + vr.x) * zoom) / old;
  //   const offsety = e.pageY - ((e.pageY + vr.y) * zoom) / old;
  //   vr.x = -offsetx;
  //   vr.y = -offsety;
  // }

  repaintTopCanvas() {
    const ctx = this.top.getContext("2d");
    this.markers.forEach((maker) => maker.render(ctx));
  }

  getViewRect() {
    return this.viewRect;
  }

  setViewRect(rect: Rect) {
    const { x, y, width, height } = this.getViewRect();
    if (
      rect.x === x &&
      rect.y === y &&
      width === rect.width &&
      height === rect.height
    ) {
      return;
    }
    this.viewRect.x = rect.x;
    this.viewRect.y = rect.y;
    this.viewRect.width = rect.width;
    this.viewRect.height = rect.height;
  }

  getLogicalPoint(event: { pageX: number; pageY: number }): Point {
    const { pageX, pageY } = event;
    let { x, y } = this.container.getBoundingClientRect();
    x = pageX - x;
    y = pageY - y;
    x += this.viewRect.x;
    y += this.viewRect.y;
    x /= this.zoom;
    y /= this.zoom;
    return { x, y };
  }

  getElementAt(event: { pageX: number; pageY: number }): Element {
    const point = this.getLogicalPoint(event);
    const elements = this.box.getElements().reverse();
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.hit(point)) {
        return element;
      }
    }
    return null;
  }

  getElementsAt(event: { pageX: number; pageY: number }): Array<Element> {
    const point = this.getLogicalPoint(event);
    const elements = this.box
      .getElements()
      .reverse()
      .filter((el) => {
        return el.hit(point);
      });
    return elements;
  }

  on(name: string, cb: Fn, context?: any): Canvas {
    this.addListener(name, cb, context);
    return this;
  }

  off(name: string, cb: Fn, context?: any): Canvas {
    this.removeListener(name, cb, context);
    return this;
  }

  once(name: string, cb: Fn, context?: any): Canvas {
    this.onceListener(name, cb, context);
    return this;
  }

  add(elementName: string, props: Record<string, any>) {
    const Clz = Canvas.clzMap.get(elementName);
    if (!Clz) {
      error("未注册的Element类型:" + elementName);
    }
    const el = new Clz();
    el.setProps(props);
    this.box.add(el);
    return el;
  }

  static clzMap: Map<string, new () => Element> = new Map();

  static registerElementClz(name: string, Clz: new () => Element) {
    Canvas.clzMap.set(name, Clz);
  }

  addMaker(maker: Maker) {
    this.markers.push(maker);
  }

  removeMaker(maker: Maker) {
    const i = this.markers.indexOf(maker);
    if (i > -1) {
      this.markers.splice(i, 1);
    }
  }

  reactiveEl(el: Element) {
    const cb = () => {
      this.pushElementToUpdateQueue(el);
    };
    el.addListener(PROP_CHANGED, cb);
    reactiveKey(el, cb, "isSelected");
    reactiveKey(el, cb, "updateFlag");
  }
}

interface Option {
  el: string | HTMLElement;
}

export default Canvas;
