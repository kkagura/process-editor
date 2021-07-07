import { DEFAULT_LAYER } from "../constant";
import { paintRoundRect } from "../utils";
import Canvas from "../view/Canvas";
import ShapeElement from "./ShapeElement";

export default class RectElement extends ShapeElement {
  props = this.reactive({
    width: 200,
    height: 100,
    x: 0,
    y: 0,
    layerId: DEFAULT_LAYER,
    fill: true,
    stroke: true,
    fillColor: "rgba(148,195,252,0.5)",
    strokeColor: "#348ffc",
    lineWidth: 2,
    radius: 4,
    name: "Normal"
  });
  render(ctx: CanvasRenderingContext2D) {
    const rect = this.getOriginalRect();
    const fill = this.getProp("fill");
    const stroke = this.getProp("stroke");
    paintRoundRect(rect, ctx, this.getProp("radius"));
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

Canvas.registerElementClz("rect", RectElement);
