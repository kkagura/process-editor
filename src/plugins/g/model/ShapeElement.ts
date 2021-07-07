import { DirFlag } from "../interface";
import Element from "./Element";
import LabelAttachment from "./LabelAttachment";
import PortAttachment from "./PortAttachment";
import ResizeAttachment from "./ResizeAttachment";

export default class ShapeElement extends Element {
  constructor() {
    super();
    this.createResizeAttachments();
    this.createPortAttachments();
    this.createLabelAttachment();
  }
  render(ctx: CanvasRenderingContext2D) {}
  onSelectionChange() {
    this.resizeAttachments.forEach((att) => {
      att.setVisible(this.isSelected);
    });
  }

  createResizeAttachments() {
    const resizeDirs: Array<DirFlag> = ["ne", "nw", "se", "sw"];
    this.resizeAttachments = resizeDirs.map((dir) => {
      const attachment = new ResizeAttachment();
      attachment.dirFlag = dir;
      attachment.attacheTo(this);
      return attachment;
    });
  }

  createPortAttachments() {
    const portDirs: Array<DirFlag> = ["n", "e", "w", "s"];
    this.portAttachments = portDirs.map((dir) => {
      const attachment = new PortAttachment();
      attachment.dirFlag = dir;
      attachment.attacheTo(this);
      return attachment;
    });
  }

  createLabelAttachment() {
    const label = new LabelAttachment();
    label.attacheTo(this);
    this.labelAttachments.push(label);
  }

  onMouseenter() {
    this.portAttachments.forEach((att) => att.setVisible(true));
  }

  onMouseleave() {
    this.portAttachments.forEach((att) => att.setVisible(false));
  }

  // beforeRender(ctx: CanvasRenderingContext2D) {
  //   super.beforeRender(ctx);
  //   this.setShadow(ctx);
  // }

  // afterRender(ctx: CanvasRenderingContext2D) {
  //   super.afterRender(ctx);
  //   this.clearShadow(ctx);
  // }
}
