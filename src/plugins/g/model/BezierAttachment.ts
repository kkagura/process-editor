import Attachment, { AttFlag } from "./Attachment";

export default class BezierAttachment extends Attachment {
  attFlag: AttFlag = "port";
  render(ctx: CanvasRenderingContext2D) {}
}
