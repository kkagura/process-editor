import { PROP_CHANGED } from "../constant";
import { reactive } from "../reactive/reactive";
import EventEmitter from "../utils/EventEmitter";
import { Props } from "./Element";

export default class Base extends EventEmitter {
  props = {};
  setProps(props: Props) {
    Object.entries(props).forEach(([key, value]) => {
      this.setProp(key, value);
    });
  }

  setProp(key: string, value: any) {
    const old = this.getProp(key);
    if (old === value) {
      return;
    }
    this.props[key] = value;
  }

  getProp(key: string) {
    return this.props[key];
  }

  emitPropChangeListener(key, oldValue, newValue) {
    this.emitListener(PROP_CHANGED, key, oldValue, newValue);
  }

  reactive<T extends object>(obj: T): T {
    return reactive(obj, this.emitPropChangeListener.bind(this));
  }
}
