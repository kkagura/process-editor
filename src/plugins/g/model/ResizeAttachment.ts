import { style } from "../constant";
import { DirFlag, Point, Rect } from "../interface";
import { paintRoundRect } from "../utils";
import Attachment, { AttFlag } from "./Attachment";

export default class ResizeAttachment extends Attachment {
  attFlag: AttFlag = "resize";
  dirFlag: DirFlag;
  radius: number = style.EDIT_ATTACHMENT_RADIUS;
  borderColor: string = style.EDIT_ATTACHMENT_BORDER_COLOR;
  fillColor: string = style.EDIT_ATTACHMENT_FILL_COLOR;
  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 1;
    paintRoundRect(this.getRect(), ctx, 2);
    ctx.fill();
    ctx.stroke();
  }
  resize(offsetx: number, offsety: number) {
    const { dirFlag, host } = this;
    let { x, y, width, height } = host.getOriginalRect();
    if (dirFlag.includes("e")) {
      width += offsetx;
    }
    if (dirFlag.includes("n")) {
      y += offsety;
      height -= offsety;
    }
    if (dirFlag.includes("s")) {
      height += offsety;
    }
    if (dirFlag.includes("w")) {
      x += offsetx;
      width -= offsetx;
    }
    if (width <= 1) {
      width = 1;
    }
    if (height <= 1) {
      height = 1;
    }
    host.setX(x);
    host.setY(y);
    host.setWidth(width);
    host.setHeight(height);
  }
  getRect() {
    const { dirFlag, host } = this;
    const { x, y, width, height } = host.getOriginalRect();
    let centerX, centerY;
    if (dirFlag === "e") {
      centerX = x + width;
      centerY = y + height / 2;
    } else if (dirFlag === "n") {
      centerX = x + width / 2;
      centerY = y;
    } else if (dirFlag === "ne") {
      centerX = x + width;
      centerY = y;
    } else if (dirFlag === "nw") {
      centerX = x;
      centerY = y;
    } else if (dirFlag === "s") {
      centerX = x + width / 2;
      centerY = y + height;
    } else if (dirFlag === "se") {
      centerX = x + width;
      centerY = y + height;
    } else if (dirFlag === "sw") {
      centerX = x;
      centerY = y + height;
    } else if (dirFlag === "w") {
      centerX = x;
      centerY = y + height / 2;
    }
    return (this.rect = {
      x: centerX - this.radius,
      y: centerY - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    });
  }
  getCursor() {
    return this.dirFlag + "-resize";
  }
}
