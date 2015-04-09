interface EventListener {
  (e: Event): any;
}

class EventDispatcher {
  private events: { [key: string]: EventListener[]; }

  constructor() {
    this.events = {}
  }

  addEventListener(key: string, listener: EventListener) {
    var listeners: EventListener[]
    if (!(key in this.events)) {
      this.events[key] = []
    }
    listeners = this.events[key]
    listeners.push(listener)
  }

  dispatchEvent(key: string, arg: Event): any{
    if (key in this.events) {
      this.events[key].forEach(l => l(arg))
    }
  }

  removeEventListener(key: string, listener: EventListener) {
    if (key in this.events) {
      this.events[key] = this.events[key].filter(l => { return l != listener })
    }
  }
}
