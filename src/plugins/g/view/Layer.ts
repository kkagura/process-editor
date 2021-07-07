import Element from "../model/Element";

export default class Layer {
  id: string = "";
  elements: Array<Element> = [];
  constructor(id: string) {
    this.id = id;
  }
  addElement(element: Element) {
    this.elements.push(element);
  }
  removeElement(element: Element): boolean {
    const i = this.elements.indexOf(element);
    if (i > -1) {
      this.elements.splice(i, 1);
      return true;
    }
    return false;
  }
}
