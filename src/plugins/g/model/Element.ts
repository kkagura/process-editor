import { DEFAULT_LAYER, SELECTION_CHANGED, style } from "../constant";
import { Point, Rect } from "../interface";
import { guid, isDef, pixelTest } from "../utils";
import { expandRect } from "../utils/math";
import Attachment from "./Attachment";
import Base from "./Base";
import BezierAttachment from "./BezierAttachment";
import LabelAttachment from "./LabelAttachment";
import PortAttachment from "./PortAttachment";
import ResizeAttachment from "./ResizeAttachment";

export type Props = Record<string, any>;
export default abstract class Element extends Base {
  props: Props = this.reactive({
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    layerId: DEFAULT_LAYER,
    name: "",
  });

  isSelected = false;

  id: string = guid();

  //  用来触发重新渲染
  updateFlag = false;

  resizeAttachments: Array<ResizeAttachment> = [];

  portAttachments: Array<PortAttachment> = [];

  labelAttachments: Array<LabelAttachment> = [];

  bezierAttachments: Array<BezierAttachment> = [];

  constructor() {
    super();
    this.addListener(SELECTION_CHANGED, this.onSelectionChange, this);
    this.addListener("mouseenter", this.onMouseenter, this);
    this.addListener("mouseleave", this.onMouseleave, this);
  }

  getId() {
    return this.id;
  }

  getName(): string {
    const v = this.getProp("name");
    return v || "";
  }

  setName(v: string) {
    this.setProp("name", v);
  }

  getLayerId(): string {
    const v = this.getProp("layerId");
    return isDef(v) ? v : DEFAULT_LAYER;
  }

  setLayerId(v: string) {
    this.setProp("layerId", v);
  }

  getWidth(): number {
    const w = this.getProp("width");
    return isDef(w) ? w : 100;
  }

  setWidth(w: number) {
    this.setProp("width", w);
  }

  getHeight(): number {
    const h = this.getProp("height");
    return isDef(h) ? h : 100;
  }

  setHeight(v: number) {
    this.setProp("height", v);
  }

  getX(): number {
    const x = this.getProp("x");
    return isDef(x) ? x : 0;
  }

  setX(v: number) {
    this.setProp("x", v);
  }

  getY(): number {
    const y = this.getProp("y");
    return isDef(y) ? y : 0;
  }

  setY(v: number) {
    this.setProp("y", v);
  }

  getLocation(): Point {
    return {
      x: this.getX(),
      y: this.getY(),
    };
  }

  setLocation(p: Point | number, y?: number) {
    if (typeof p === "number") {
      this.setX(p);
      this.setY(y);
    } else {
      this.setX(p.x);
      this.setY(p.y);
    }
  }

  setCenterLocation(p: Point | number, y?: number) {
    const w = this.getWidth();
    const h = this.getHeight();
    if (typeof p === "number") {
      this.setX(p - w / 2);
      this.setY(y - h / 2);
    } else {
      this.setX(p.x - w / 2);
      this.setY(p.y - h / 2);
    }
  }

  setProps(props: Props) {
    Object.entries(props).forEach(([key, value]) => {
      this.setProp(key, value);
    });
  }

  setProp(key: string, value: any) {
    const old = this.getProp(key);
    if (old === value) {
      return;
    }
    this.props[key] = value;
  }

  getProp(key: string) {
    return this.props[key];
  }

  getOriginalRect(): Rect {
    return {
      x: this.getX(),
      y: this.getY(),
      height: this.getHeight(),
      width: this.getWidth(),
    };
  }

  getRect(): Rect {
    return this.getOriginalRect();
  }

  getViewRect(): Rect {
    return this.getRect();
  }

  update(ctx: CanvasRenderingContext2D) {
    this.beforeRender(ctx);
    this.render(ctx);
    this.afterRender(ctx);
  }

  beforeRender(ctx: CanvasRenderingContext2D) {
    this.setShadow(ctx);
  }

  abstract render(ctx: CanvasRenderingContext2D);

  afterRender(ctx: CanvasRenderingContext2D) {
    this.clearShadow(ctx);
    this.renderAttachments(ctx);
  }

  renderAttachments(ctx: CanvasRenderingContext2D) {
    const attachments = this.getAttachments();
    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i];
      att.isVisible() && att.render(ctx);
    }
  }

  hit(point: Point): boolean {
    const { x, y, width, height } = this.getRect();
    if (this.hitOnAttachment(point)) {
      return true;
    }
    if (
      point.x >= x &&
      point.y >= y &&
      point.x <= x + width &&
      point.y <= y + height
    ) {
      return this.hitOnPixel(point);
    }
    return false;
  }

  hitOnPixel(point) {
    return pixelTest(
      this.render.bind(this),
      point,
      expandRect(this.getRect(), 5)
    );
  }

  hitOnAttachment(point: Point): Attachment {
    const atts = this.getAttachments();
    for (let i = 0; i < atts.length; i++) {
      if (atts[i].hit(point)) {
        return atts[i];
      }
    }
    return null;
  }

  destory() {
    this.clearListeners();
  }

  createResizeAttachments() {}

  createPortAttachments() {}

  createLabelAttachment() {}

  createBezierAttachment() {}

  getAttachments(): Array<Attachment> {
    return [
      ...this.resizeAttachments,
      ...this.portAttachments,
      ...this.labelAttachments,
      ...this.bezierAttachments,
    ];
  }

  onSelectionChange() {}

  onMouseenter(e: MouseEvent) {}

  onMouseleave(e: MouseEvent) {}

  forceUpdate() {
    this.updateFlag = !this.updateFlag;
  }

  setShadow(ctx: CanvasRenderingContext2D) {
    ctx.shadowBlur = style.SHADOW_BLUR;
    ctx.shadowColor = this.isSelected
      ? style.SELECTED_SHADOW_COLOR
      : style.SHADOW_COLOR;
  }

  clearShadow(ctx: CanvasRenderingContext2D) {
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
  }
}
