import {
  BEFORE_ELEMENT_ADD,
  BEFORE_ELEMENT_REMOVE,
  DEFAULT_LAYER,
  ELEMENT_ADDED,
  ELEMENT_BOX_CHANGED,
  ELEMENT_REMOVED,
  LINK_LAYER,
} from "../constant";
import { ElementBoxChangeEvent } from "../interface";
import Element from "../model/Element";
import { error } from "../utils";
import EventEmitter from "../utils/EventEmitter";
import Layer from "./Layer";

export default class Box extends EventEmitter {
  layers: Array<Layer> = [];
  layerMap: Map<string, Layer> = new Map();
  elMap: Map<string, Element> = new Map();
  constructor() {
    super();
    this.createLayer(LINK_LAYER);
    this.createLayer(DEFAULT_LAYER);
  }

  createLayer(id: string) {
    if (this.layerMap.has(id)) {
      error("已存在相同 ID layer:" + id);
    }
    const layer = new Layer(id);
    this.layers.push(layer);
    this.layerMap.set(id, layer);
  }

  getLayerById(id: string): Layer {
    if (this.layerMap.has(id)) {
      return this.layerMap.get(id);
    }
    return this.layerMap.get(DEFAULT_LAYER);
  }

  add(element: Element) {
    const id = element.getId();
    if (this.elMap.has(id)) {
      error("存在相同id的元素:" + id);
    }
    const layerId = element.getLayerId();
    const layer = this.getLayerById(layerId);
    this.emitListener(BEFORE_ELEMENT_ADD, element);
    layer.addElement(element);
    this.emitListener(ELEMENT_ADDED, element);
    this.emitElementBoxChangeEvent(ELEMENT_ADDED, element);
    this.elMap.set(id, element);
  }

  remove(element: Element) {
    if (!this.contains(element)) {
      return;
    }
    const layerId = element.getLayerId();
    const layer = this.getLayerById(layerId);
    this.emitListener(BEFORE_ELEMENT_REMOVE, element);
    element.emitListener(BEFORE_ELEMENT_REMOVE);
    const res = layer.removeElement(element);
    if (res) {
      const { portAttachments } = element;
      portAttachments.forEach((p) => {
        if (p.link) {
          this.remove(p.link);
        }
      });
      element.emitListener(ELEMENT_REMOVED);
      this.emitListener(ELEMENT_REMOVED, element);
      this.emitElementBoxChangeEvent(ELEMENT_REMOVED, element);
      this.elMap.delete(element.getId());
      element.destory();
    }
  }

  emitElementBoxChangeEvent(kind: string, source: Element) {
    const event: ElementBoxChangeEvent = {
      kind,
      source,
    };
    this.emitListener(ELEMENT_BOX_CHANGED, event);
  }

  getElements(filter?: (el: Element) => boolean | null): Array<Element> {
    const res = [];
    this.layers.forEach((layer) => {
      layer.elements.forEach((el) => {
        if (filter && !filter(el)) {
          return;
        }
        res.push(el);
      });
    });
    return res;
  }

  contains(el: Element): boolean {
    return this.elMap.has(el.getId());
  }
}
