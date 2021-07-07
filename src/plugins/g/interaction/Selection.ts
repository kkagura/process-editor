import { SELECTION_CHANGED } from "../constant";
import { Element } from "../model";
import EventEmitter from "../utils/EventEmitter";
import Canvas from "../view/Canvas";

export default class Selection extends EventEmitter {
  canvas: Canvas;
  selected: Element;
  selection: Array<Element> = [];
  constructor(canvas: Canvas) {
    super();
    this.canvas = canvas;
  }
  set(el: Element) {
    this.clear();
    this.selected = el;
    this.selection = [el];
    el.isSelected = true;
    el.emitListener(SELECTION_CHANGED);
    this.emitListener(SELECTION_CHANGED, {
      kind: "add",
      source: [el],
    });
  }
  append(el: Element) {
    this.selected = el;
    this.selection.push(el);
    el.isSelected = true;
    el.emitListener(SELECTION_CHANGED);
    this.emitListener(SELECTION_CHANGED, el);
    this.emitListener(SELECTION_CHANGED, {
      kind: "add",
      source: [el],
    });
  }
  remove(el: Element) {
    const i = this.selection.indexOf(el);
    if (i > -1) {
      this.selection.splice(i, 1);
      if (this.selected === el) {
        this.selected = this.selection[this.selection.length - 1] || null;
      }
      el.isSelected = false;
      el.emitListener(SELECTION_CHANGED);
      this.emitListener(SELECTION_CHANGED, {
        kind: "remove",
        source: [el],
      });
    }
  }
  clear() {
    const selection = this.selection;
    for (let i = 0; i < selection.length; i++) {
      const el = this.selection[i];
      el.isSelected = false;
      el.emitListener(SELECTION_CHANGED);
    }
    if (selection.length > 0) {
      this.emitListener(SELECTION_CHANGED, {
        kind: "remove",
        source: selection,
      });
    }
    this.selected = null;
    this.selection = [];
  }
  getSelection() {
    return this.selection;
  }
}
