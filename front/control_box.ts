class ControlBox {
  private element: HTMLElement;

  private button: Button;
  private originsBox: OriginsBox;

  private dispatcher: EventDispatcher;

  constructor(){
    this.element = document.createElement("div");
    this.element.className = "ichigo-controller-box hide-origins";

    this.originsBox = new OriginsBox();
    this.originsBox.addEventListener("selectEndpoint", this.selectEndpoint.bind(this));
    this.originsBox.put(this.element);

    this.button = new Button();
    this.button.put(this.element);

    this.button.addEventListener("open", this.showMenu.bind(this));
    this.element.addEventListener("click", this.hideMenu.bind(this));
    this.button.addEventListener("close", this.close.bind(this));

    this.dispatcher = new EventDispatcher();
  }

  addEventListener(key: string, listener: EventListener) { this.dispatcher.addEventListener(key, listener); }
  dispatchEvent(key: string, arg: Event): any { this.dispatcher.dispatchEvent(key, arg); }
  removeEventListener(key: string, listener: EventListener) { this.dispatcher.removeEventListener(key, listener); }

  setOrigin(origin: Origin) {
    this.originsBox.setOrigin(origin);
    this.button.setOrigin(origin);
  }

  clearOrigins() {
    this.originsBox.clear();
  }

  selectEndpoint(e: Event) {
    this.dispatchEvent("selectEndpoint", e);
  }

  showMenu(e: MouseEvent): any {
    this.element.className = "ichigo-controller-box show-origins";
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  close(e: MouseEvent): any {
    this.element.className = "ichigo-controller-box closed";
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  hideMenu(e: MouseEvent): any {
    this.element.className = "ichigo-controller-box hide-origins";
    e.preventDefault();
    e.stopPropagation();
    return false;
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
