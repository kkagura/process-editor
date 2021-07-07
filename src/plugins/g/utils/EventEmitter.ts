interface Handler {
  callback(...args: Array<any>);
  source(...args: Array<any>);
  context?: any;
}

export type Fn = (...args: Array<any>) => any;

export default class EventEmitter {
  private queue: Record<string, Array<Handler>> = {};

  addListener(name: string, func: Fn, context?: any) {
    if (this.findListener(name, func, context) > -1) {
      return;
    }
    const handlers = this.queue[name] || (this.queue[name] = []);
    const handler: Handler = {
      callback: context
        ? function (...args) {
            func.apply(context, args);
          }
        : func,
      source: func,
      context,
    };
    handlers.push(handler);
  }

  findListener(name: string, func: Fn, context?: any): number {
    const handlers = this.queue[name];
    if (!handlers) {
      return -1;
    }
    for (let i = 0; i < handlers.length; i++) {
      if (handlers[i].source === func && context === handlers[i].context) {
        return i;
      }
    }
    return -1;
  }

  removeListener(name: string, func?: Fn, context?: any) {
    const handlers = this.queue[name];
    if (!handlers) {
      return;
    }
    if (!func) {
      delete this.queue[name];
      return;
    }
    const i = this.findListener(name, func, context);
    if (i > -1) {
      handlers.splice(i, 1);
    }
  }

  emitListener(name: string, ...args: Array<any>) {
    const handlers = this.queue[name];
    if (!handlers) {
      return;
    }
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].callback(...args);
    }
  }

  onceListener(name: string, func: Fn, context?: any) {
    if (this.findListener(name, func, context) > -1) {
      return;
    }
    const handlers = this.queue[name] || (this.queue[name] = []);
    const handler: Handler = {
      callback: (...args) => {
        context ? func.apply(context, args) : func(...args);
        this.removeListener(name, func, context);
      },
      source: func,
      context,
    };
    handlers.push(handler);
  }

  clearListeners() {
    this.queue = {};
  }
}
