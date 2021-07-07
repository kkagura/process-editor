import { DEFAULT_LAYER } from "../constant";
import Canvas from "../view/Canvas";
import ShapeElement from "./ShapeElement";

export default class EllipseElement extends ShapeElement {
  props = this.reactive({
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    layerId: DEFAULT_LAYER,
    fill: true,
    stroke: true,
    fillColor: "rgba(252,225,185,0.5)",
    strokeColor: "#fcc070",
    lineWidth: 2,
    radius: 4,
    name: "Start",
  });
  render(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.getOriginalRect();
    const fill = this.getProp("fill");
    const stroke = this.getProp("stroke");
    ctx.save();
    const scale = height / width;
    ctx.scale(1, scale);
    ctx.arc(x + width / 2, (y + height / 2) / scale, width / 2, 0, 2 * Math.PI);
    ctx.restore();

    if (fill) {
      ctx.fillStyle = this.getProp("fillColor");
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = this.getProp("strokeColor");
      ctx.lineWidth = this.getProp("lineWidth");
      ctx.stroke();
    }
  }
}

Canvas.registerElementClz("ellipse", EllipseElement);
