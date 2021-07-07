import { style } from "../constant";
import { DirFlag } from "../interface";
import Attachment, { AttFlag } from "./Attachment";
import LinkElement from "./LinkElement";

export type PortInteractionStatus =
  | "selected" //  被选中的端口
  | "approached" //  被靠近的端口
  | "normal" //  正常状态
  | "await"; //  创建连线时的其它端口
export default class PortAttachment extends Attachment {
  dirFlag: DirFlag;
  radius: number = style.EDIT_ATTACHMENT_RADIUS;
  borderColor: string = style.PORT_ATTACHMENT_BORDER_COLOR;
  fillColor: string = style.PORT_ATTACHMENT_FILL_COLOR;
  attFlag: AttFlag = "port";
  interactionStatus: PortInteractionStatus = "normal";
  link: LinkElement;
  render(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.getRect();
    const { interactionStatus } = this;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = this.radius;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.rect = {
      x: centerX - this.radius,
      y: centerY - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
    ctx.fillStyle =
      interactionStatus === "selected"
        ? style.PORT_ATTACHMENT_SELECTED_COLOR
        : this.fillColor;
    ctx.fill();
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    // paintRoundRect(this.rect, ctx, 2);
    // ctx.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    ctx.stroke();
    if (interactionStatus === "await") {
      ctx.arc(centerX, centerY, radius * 3, 0, 2 * Math.PI);
      ctx.fillStyle = style.PORT_ATTACHMENT_AWAIT_COLOR;
      ctx.fill();
    } else if (interactionStatus === "approached") {
      ctx.arc(centerX, centerY, radius * 4, 0, 2 * Math.PI);
      ctx.fillStyle = style.PORT_ATTACHMENT_APPROACHED_COLOR;
      ctx.fill();
    }
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
  setInteractionStatus(s: PortInteractionStatus) {
    this.interactionStatus = s;
    this.forceUpdate();
  }
  getCursor() {
    return "crosshair";
  }
}
