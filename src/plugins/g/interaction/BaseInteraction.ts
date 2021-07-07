import { Maker, Point } from "../interface";
import { Element } from "../model";
import Canvas from "../view/Canvas";
import ResizeAttachment from "../model/ResizeAttachment";
import { contains, setStyle } from "../utils";
import filters from "../utils/filters";
import LinkElement from "../model/LinkElement";
import PortAttachment from "../model/PortAttachment";
import ShapeElement from "../model/ShapeElement";

type EventType =
  | "click"
  | "mousedown"
  | "mouseup"
  | "mouseenter"
  | "mouseleave"
  | "dbclick";

export default class BaseInteraction implements Maker {
  canvas: Canvas;
  mousedown = false;
  endPoint: Point;
  zoomStep: number = 0.1;
  clickTarget: Element;
  moveTarget: Element;
  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.setup();
  }
  setup() {
    const { wraper } = this.canvas;
    wraper.addEventListener("mousedown", this.onMousedown);
    wraper.addEventListener("mousemove", this.onMousemove);
    wraper.addEventListener("mouseup", this.onMouseup);
    window.addEventListener("keydown", this.onKeypress);
    wraper.addEventListener("dblclick", this.onDBClick);
    wraper.addEventListener("wheel", this.onMousewheel);
    wraper.addEventListener("click", this.onClick);
  }
  onKeypress = (e: KeyboardEvent) => {
    if (!contains(this.canvas.wraper, e.target as Node)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // console.log(e.key);
    if (e.key === "Delete") {
      this.removeSelectedEls();
    }
  };
  removeSelectedEls() {
    const selectedNodes = this.canvas.selection.getSelection();
    selectedNodes.forEach((el) => {
      this.canvas.box.remove(el);
    });
  }
  onMousedown = (e: MouseEvent) => {
    this.mousedown = true;
    const el = (this.clickTarget = this.hitOnElement(e));
    const logicalPoint = this.canvas.getLogicalPoint(e);
    const { selection } = this.canvas;
    if (el) {
      if (e.ctrlKey) {
        if (el.isSelected) {
          selection.remove(el);
        } else {
          selection.append(el);
        }
      } else if (!el.isSelected) {
        selection.set(el);
      }
      const att = el.hitOnAttachment(logicalPoint);
      if (att) {
        if (att.attFlag === "resize") {
          this.handleResizeElement(logicalPoint, att as ResizeAttachment);
        } else if (att.attFlag === "port") {
          this.handleCreateLink(logicalPoint, att as PortAttachment);
        }
      } else {
        this.handleMoveElement(logicalPoint);
      }
    } else if (!e.ctrlKey) {
      selection.clear();
      this.handleMoveCanvas(e);
    }
    this.emitEvent(el, "mousedown");
  };
  onDBClick = (e: MouseEvent) => {
    const el = this.hitOnElement(e);
    this.emitEvent(el, "dbclick");
  };
  handleResizeElement(prevPoint: Point, att: ResizeAttachment) {
    const move = (e: MouseEvent) => {
      const point = this.canvas.getLogicalPoint(e);
      const offsetx = point.x - prevPoint.x;
      const offsety = point.y - prevPoint.y;
      prevPoint = point;
      att.resize(offsetx, offsety);
    };
    this.bindMoveEvent(move);
  }
  handleMoveElement(prevPoint: Point) {
    const move = (e: MouseEvent) => {
      const point = this.canvas.getLogicalPoint(e);
      const offsetx = point.x - prevPoint.x;
      const offsety = point.y - prevPoint.y;
      prevPoint = point;
      const { selection } = this.canvas.selection;
      selection.forEach((el) => {
        if (filters.movable(el)) {
          const { x, y } = el.getLocation();
          el.setLocation(x + offsetx, y + offsety);
        }
      });
    };
    this.bindMoveEvent(move);
  }
  handleMoveCanvas(e: MouseEvent) {
    let prevPoint = {
      x: e.pageX,
      y: e.pageY,
    };
    const move = (e: MouseEvent) => {
      const point = {
        x: e.pageX,
        y: e.pageY,
      };
      const offsetx = point.x - prevPoint.x;
      const offsety = point.y - prevPoint.y;
      prevPoint = point;
      this.canvas.viewRect.x -= offsetx;
      this.canvas.viewRect.y -= offsety;
    };
    this.bindMoveEvent(move);
  }
  handleCreateLink(prevPoint: Point, att: PortAttachment) {
    let el: LinkElement,
      allPorts: Array<PortAttachment> = [],
      to: PortAttachment;
    const move = (e: MouseEvent) => {
      const { canvas } = this;
      const point = canvas.getLogicalPoint(e);
      if (!el) {
        el = new LinkElement();
        el.setFromPort(att);
        el.setToPoint(point);
        el.setName("" + Math.random());
        canvas.box.add(el);
        att.setInteractionStatus("selected");
        canvas.box.getElements((el) => {
          if (el instanceof ShapeElement) {
            const { portAttachments } = el;
            portAttachments.forEach((port) => {
              // if ()
              // if (port === att) {
              //   port.setInteractionStatus("selected");
              // } else {
              //   port.setInteractionStatus("await");
              // }
              port.setVisible(true);
            });
            allPorts.push(...portAttachments);
          }
          return false;
        });
      } else {
        to = null;
        allPorts.forEach((p) => {
          if (att !== p) {
            if (p.hit(point, p.radius * 2)) {
              to = p;
            }
            p.setInteractionStatus("await");
          }
        });
        to && to.setInteractionStatus("approached");
        el.setToPort(to);
        el.setToPoint(point);
      }
    };
    const up = () => {
      allPorts.forEach((att) => {
        att.setInteractionStatus("normal");
        att.setVisible(false);
      });
    };
    this.bindMoveEvent(move, up);
  }
  bindMoveEvent(
    onMousemove: (e: MouseEvent) => void,
    up?: (e?: MouseEvent) => void
  ) {
    const { wraper } = this.canvas;
    const onMouseup = (e) => {
      up && up(e);
      wraper.removeEventListener("mousemove", onMousemove);
      wraper.removeEventListener("mouseup", onMouseup);
      wraper.removeEventListener("mouseleave", onMouseup);
    };
    wraper.addEventListener("mousemove", onMousemove);
    wraper.addEventListener("mouseup", onMouseup);
    wraper.addEventListener("mouseleave", onMouseup);
  }
  onMouseup = () => {
    this.mousedown = false;
    this.emitEvent(this.clickTarget, "mouseup");
    this.clickTarget = null;
    this.changeCursor("default");
  };
  onMousemove = (e: MouseEvent) => {
    if (!this.mousedown) {
      const el = this.canvas.getElementAt(e);
      if (el === this.moveTarget) {
        if (el) {
          const p = this.canvas.getLogicalPoint(e);
          const attachment = el.hitOnAttachment(p);
          if (attachment) {
            this.changeCursor(attachment.getCursor());
          } else if (filters.movable(el)) {
            this.changeCursor("move");
          }
        }
        return;
      }
      if (el) {
        this.emitEvent(el, "mouseenter");
        const p = this.canvas.getLogicalPoint(e);
        const attachment = el.hitOnAttachment(p);
        if (attachment) {
          this.changeCursor(attachment.getCursor());
        } else if (filters.movable(el)) {
          this.changeCursor("move");
        }
      } else {
        this.changeCursor("default");
      }
      if (this.moveTarget) {
        this.emitEvent(this.moveTarget, "mouseleave");
      }
      this.moveTarget = el;
    }
  };
  onClick = (e: MouseEvent) => {
    const element = this.hitOnElement(e);
    this.emitEvent(element, "click");
  };
  onKeydown = (e: KeyboardEvent) => {};
  onKeyup = (e: KeyboardEvent) => {};
  emitEvent(element: Element, type: EventType, event?: Event) {
    const eventName = type + ":" + (element ? element.getName() : "canvas");
    if (element) {
      element.emitListener(type, this.canvas, event);
    }
    this.canvas.emitListener(eventName, element, event);
  }
  hitOnElement(e: MouseEvent) {
    const element = this.canvas.getElementAt(e);
    return element;
  }
  onMousewheel = (e: WheelEvent) => {
    const zoomStep = e.deltaY < 0 ? this.zoomStep : -this.zoomStep;
    const { canvas } = this;
    const old = canvas.zoom;
    let zoom = canvas.zoom + zoomStep;
    zoom = Math.max(zoom, 0.1);
    zoom = Math.min(zoom, 10);
    canvas.zoom = zoom;
    const vr = canvas.getViewRect();
    const offsetx = e.pageX - ((e.pageX + vr.x) * zoom) / old;
    const offsety = e.pageY - ((e.pageY + vr.y) * zoom) / old;
    vr.x = -offsetx;
    vr.y = -offsety;
  };
  destroy() {
    const { wraper } = this.canvas;
    wraper.removeEventListener("mousedown", this.onMousedown);
    wraper.removeEventListener("mousemove", this.onMousemove);
    wraper.removeEventListener("mouseup", this.onMouseup);
    wraper.removeEventListener("keypress", this.onKeypress);
    wraper.removeEventListener("dblclick", this.onDBClick);
    wraper.removeEventListener("wheel", this.onMousewheel);
    wraper.removeEventListener("click", this.onClick);
  }
  changeCursor(c: string) {
    setStyle(this.canvas.wraper, {
      cursor: c,
    });
  }
  render(ctx: CanvasRenderingContext2D) {}
}
