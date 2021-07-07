import Element from "../model/Element";
import Canvas from "../view/Canvas";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElementBoxChangeEvent {
  kind: string;
  source: Element;
}

export interface Point {
  x: number;
  y: number;
}

export interface SelectionChangeEvent {
  kind: "add" | "remove";
  source: Array<Element>;
}

export interface Maker {
  render(ctx: CanvasRenderingContext2D);
  canvas: Canvas
}
