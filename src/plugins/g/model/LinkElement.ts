import {
  BEFORE_ELEMENT_REMOVE,
  HOST_PROP_CHANGED,
  LINK_LAYER,
} from "../constant";
import { DirFlag, Point, Rect } from "../interface";
import { calPolylinePoints, paintLine, pixelTest } from "../utils";
import Element from "./Element";
import PortAttachment from "./PortAttachment";

export type LineType = "smooth" | "polyline" | "polylineRound";
export type Points = Array<Point>;

export default class extends Element {
  from: PortAttachment;
  to: PortAttachment;
  points: Points;
  props = this.reactive({
    lineType: "polyline",
    points: null,
    toPoint: null,
    layerId: LINK_LAYER,
  });
  setPoints(points: Points) {
    this.setProp("points", points);
  }
  getPoints() {
    let points = this.getProp("points");
    if (!points) {
      points = this.calPoints();
      this.setPoints(points);
    }
    return points;
  }
  getLineType(): LineType {
    return this.getProp("lineType");
  }
  setLineType(t: LineType) {
    this.setProp("lineType", t);
  }
  getFromPoint(): Point {
    const from = this.from;
    return from.getCenterLocation();
  }
  setToPoint(p: Point) {
    this.setProp("toPoint", p);
    this.setProp("points", null);
  }
  getToPoint(): Point {
    return this.to ? this.to.getCenterLocation() : this.getProp("toPoint");
  }
  setFromPort(p: PortAttachment) {
    this.from = p;
    p.link = this;
    this.addPortListener(p, true);
  }
  setToPort(p: PortAttachment) {
    if (this.to === p) {
      return;
    }
    this.to && (this.to.link = null);
    this.removePortListener(this.to, false);
    this.to = p;
    p && (p.link = this);
    this.addPortListener(p, false);
    this.setPoints(null);
  }
  calPoints(): Points {
    const type = this.getLineType();
    const fromPoint = this.getFromPoint();
    const toPoint = this.getToPoint();
    const fromDir = this.from.dirFlag;
    const res = [fromPoint];
    if (type === "polyline") {
      const points = calPolylinePoints(
        fromPoint,
        toPoint,
        fromDir,
        this.to ? this.to.dirFlag : null,
        this.from.host.getRect(),
        this.to && this.to.host.getRect()
      );
      res.push(...points);
    }
    res.push(toPoint);
    return res;
  }
  render(ctx: CanvasRenderingContext2D) {
    const points = this.getPoints();
    const type = this.getLineType();
    paintLine(ctx, points, type);
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  onFromPortPropChanged(key, oldValue, newValue) {
    if (["x", "y", "width", "height"].includes(key)) {
      this.setProp("points", null);
    }
  }
  onToPortPropChanged(key, oldValue, newValue) {
    if (["x", "y", "width", "height"].includes(key)) {
      this.setProp("points", null);
    }
  }
  destory() {
    this.from.removeListener(
      HOST_PROP_CHANGED,
      this.onFromPortPropChanged,
      this
    );
    this.removePortListener(this.from, true);
    this.removePortListener(this.to, false);
  }
  addPortListener(p: PortAttachment, isFrom: boolean) {
    if (!p) {
      return;
    }
    if (isFrom) {
      p.addListener(HOST_PROP_CHANGED, this.onFromPortPropChanged, this);
    } else {
      p.addListener(HOST_PROP_CHANGED, this.onToPortPropChanged, this);
    }
  }
  removePortListener(p: PortAttachment, isFrom: boolean) {
    if (!p) {
      return;
    }
    if (isFrom) {
      p.removeListener(HOST_PROP_CHANGED, this.onFromPortPropChanged, this);
    } else {
      p.removeListener(HOST_PROP_CHANGED, this.onToPortPropChanged, this);
    }
  }
  getOriginalRect(): Rect {
    let minx = Infinity,
      miny = Infinity,
      maxx = -Infinity,
      maxy = -Infinity;
    const points = this.getPoints();
    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      if (x < minx) {
        minx = x;
      }
      if (x > maxx) {
        maxx = x;
      }
      if (y < miny) {
        miny = y;
      }
      if (y > maxy) {
        maxy = y;
      }
    }
    return {
      x: minx,
      y: miny,
      width: maxx - minx,
      height: maxy - miny,
    };
  }
}
