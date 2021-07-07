import { DEFAULT_LAYER } from "../constant";
import { paintLine, paintRoundRect } from "../utils";
import Canvas from "../view/Canvas";
import ShapeElement from "./ShapeElement";

export default class DiamondElement extends ShapeElement {
  props = this.reactive({
    width: 150,
    height: 100,
    x: 0,
    y: 0,
    layerId: DEFAULT_LAYER,
    fill: true,
    stroke: true,
    fillColor: "rgba(169,250,244, 0.5)",
    strokeColor: "#68dcd3",
    lineWidth: 2,
    radius: 4,
    name: "Decision",
  });
  render(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.getOriginalRect();
    ctx.lineJoin = "round";
    paintLine(
      ctx,
      [
        {
          x: x + width / 2,
          y,
        },
        {
          x: x + width,
          y: y + height / 2,
        },
        {
          x: x + width / 2,
          y: y + height,
        },
        {
          x,
          y: y + height / 2,
        },
      ],
      "polyline"
    );
    ctx.closePath();
    const fill = this.getProp("fill");
    const stroke = this.getProp("stroke");
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

Canvas.registerElementClz("diamond", DiamondElement);
