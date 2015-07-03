class Button {
  private element: HTMLElement;
  private closeElement: HTMLElement;
  private dispatcher: EventDispatcher;
  private statuses: { [name: string]: StatusBox; };

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "open-button";
    this.element.addEventListener("click", this.open.bind(this));

    this.closeElement = document.createElement("div");
    this.closeElement.className = "close-button";
    this.closeElement.appendChild(document.createTextNode("\u26D4"));
    this.closeElement.addEventListener("click", this.close.bind(this));
    this.element.appendChild(this.closeElement);

    this.dispatcher = new EventDispatcher();

    this.statuses = {};
  }

  addEventListener(key: string, listener: EventListener) { this.dispatcher.addEventListener(key, listener); }
  dispatchEvent(key: string, arg: Event): any { this.dispatcher.dispatchEvent(key, arg); }
  removeEventListener(key: string, listener: EventListener) { this.dispatcher.removeEventListener(key, listener); }

  setOrigin(origin: Origin) {
    var statusBox = this.statuses[origin.name];
    if (!statusBox) {
      statusBox = new StatusBox(origin);
      statusBox.put(this.element);

      this.statuses[origin.name] = statusBox;
    }
    statusBox.setOrigin(origin);
  }

  clearOrigins() {
    // todo: status
  }

  open(e: MouseEvent): any {
    this.dispatchEvent("open", e);
  }

  close(e: MouseEvent): any {
    this.dispatchEvent("close", e);
  }

  put(parent: HTMLElement) {
    parent.appendChild(this.element);
  }

  delete() {
    if (this.element && this.element.parentNode){
      this.element.parentNode.removeChild(this.element);
    }
  }
}
