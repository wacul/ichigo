class OriginsBox {
  private element: HTMLElement;
  private origins: { [name: string]: OriginBox; };

  private dispatcher: EventDispatcher;

  constructor(){
    this.element = document.createElement("table");
    this.element.className = "list-origins";

    this.dispatcher = new EventDispatcher();

    this.origins = {};
  }

  addEventListener(key: string, listener: EventListener) { this.dispatcher.addEventListener(key, listener); }
  dispatchEvent(key: string, arg: Event): any { this.dispatcher.dispatchEvent(key, arg); }
  removeEventListener(key: string, listener: EventListener) { this.dispatcher.removeEventListener(key, listener); }

  setOrigin(origin: Origin) {
    var originBox = this.origins[origin.name];
    if (!originBox) {
      originBox = new OriginBox(origin);
      originBox.put(this.element);
      originBox.addEventListener("show", this.hideMenu.bind(this));
      originBox.addEventListener("selectEndpoint", this.selectEndpoint.bind(this));

      this.origins[origin.name] = originBox;
    }
    originBox.setOrigin(origin);
  }

  hideMenu(e: Event) {
    for (var name in this.origins) {
      var origin = this.origins[name];
      if (origin.getOrigin().name != e["originName"]) {
        this.origins[name].hideMenu();
      }
    }
  }

  selectEndpoint(e: Event) {
    this.dispatchEvent("selectEndpoint", e);
  }

  clear() {
    for (var name in this.origins) {
      this.origins[name].delete();
    }
    this.origins = {};
  }

  put(parent: HTMLElement){
    parent.appendChild(this.element);
  }

  delete() {
    if (this.element && this.element.parentNode){
      this.element.parentNode.removeChild(this.element);
    }
  }
}
