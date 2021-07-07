import { Element } from "../model";
import ShapeElement from "../model/ShapeElement";

export default {
  movable(el: Element) {
    return el instanceof ShapeElement;
  },
};
