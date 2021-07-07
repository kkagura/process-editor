import { fillText } from "../utils";
import { createEditor } from "../utils/mte";
import Canvas from "../view/Canvas";
import Attachment, { AttFlag } from "./Attachment";
import Element from "./Element";

export default class LabelAttachment extends Attachment {
  attFlag: AttFlag = "label";
  visible: boolean = true;
  render(ctx: CanvasRenderingContext2D) {
    const name = this.host.getName();
    ctx.save();
    const { x, y, width, height } = this.getRect();
    ctx.rect(x, y, width, height);
    ctx.clip();
    fillText(ctx, name, "20px Arial", "#000", { x, y, width, height });
    ctx.restore();
  }
  hit() {
    return false;
  }
  getRect() {
    return this.host.getRect();
  }
  showInput(canvas: Canvas, e: MouseEvent) {
    let { x, y, width, height } = this.getRect();
    const { zoom, container, viewRect } = canvas;
    x = x * zoom - viewRect.x + container.offsetLeft;
    y = y * zoom - viewRect.y + container.offsetTop;
    createEditor(
      this.host.getName(),
      (text: string) => this.host.setName(text),
      {
        left: x + "px",
        top: y + "px",
        width: width + "px",
        height: height + "px",
        transform: `scale(${zoom})`,
      }
    );
  }
  attacheTo(el: Element) {
    super.attacheTo(el);
    el.addListener("dbclick", this.showInput, this);
  }
  destroy() {
    super.destroy();
    this.host.removeListener("dbclick", this.showInput, this);
  }
}
