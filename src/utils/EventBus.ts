interface Handler {
  callback(...args: Array<any>);
  source(...args: Array<any>);
  context?: any;
}

type Fn = (...args: Array<any>) => any;

class EventBus {
  private queue: Record<string, Array<Handler>> = {};

  on(name: string, func: Fn, context?: any) {
    if (this.hit(name, func, context) > -1) {
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

  hit(name: string, func: Fn, context?: any): number {
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

  off(name: string, func?: Fn, context?: any) {
    const handlers = this.queue[name];
    if (!handlers) {
      return;
    }
    if (!func) {
      delete this.queue[name];
      return;
    }
    const i = this.hit(name, func, context);
    if (i > -1) {
      handlers.splice(i, 1);
    }
  }

  emit(name: string, ...args: Array<any>) {
    const handlers = this.queue[name];
    if (!handlers) {
      return;
    }
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].callback(...args);
    }
  }

  once(name: string, func: Fn, context?: any) {
    if (this.hit(name, func, context) > -1) {
      return;
    }
    const handlers = this.queue[name] || (this.queue[name] = []);
    const handler: Handler = {
      callback: (...args) => {
        context ? func.apply(context, args) : func(...args);
        this.off(name, func, context);
      },
      source: func,
      context,
    };
    handlers.push(handler);
  }

  destroy() {
    this.queue = {};
  }
}

export default new EventBus();
