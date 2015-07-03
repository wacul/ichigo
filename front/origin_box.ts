class OriginBox {
  private element: HTMLElement;
  private nameElement: HTMLElement;
  private keyElement: HTMLElement;
  private endpointElement: HTMLElement;

  private endpoints: EndpointsBox;
  private origin: Origin;

  private dispatcher: EventDispatcher;

  constructor(origin: Origin){
    this.element = document.createElement("tr");
    this.element.className = "origin hide-endpoints";

    this.nameElement = document.createElement("td");
    this.nameElement.className = "name";
    this.element.appendChild(this.nameElement);

    this.keyElement = document.createElement("td");
    this.keyElement.className = "endpoint-key";
    this.keyElement.addEventListener("click", this.showMenu.bind(this));
    this.element.appendChild(this.keyElement);

    this.endpointElement = document.createElement("td");
    this.endpointElement.className = "endpoints";
    this.element.appendChild(this.endpointElement);

    this.endpoints = new EndpointsBox();
    this.endpoints.addEventListener("select", this.selectEndpoint.bind(this));
    this.endpoints.put(this.endpointElement);

    this.dispatcher = new EventDispatcher();

    this.setOrigin(origin);
  }

  addEventListener(key: string, listener: EventListener) { this.dispatcher.addEventListener(key, listener); }
  dispatchEvent(key: string, arg: Event): any { this.dispatcher.dispatchEvent(key, arg); }
  removeEventListener(key: string, listener: EventListener) { this.dispatcher.removeEventListener(key, listener); }

  setOrigin(origin: Origin) {
    if (!origin) {
      return;
    }
    setText(this.nameElement, origin.name);
    setText(this.keyElement, origin.endpointKey);
    this.keyElement.className = "endpoint-key "+origin.endpointKey;

    this.keyElement.title = origin.endpointURL;
    if (origin.endpoints && origin.endpoints.length > 1) {
      this.keyElement.className += " selectable";
    }

    for (var key in origin.endpoints) {
      this.endpoints.setEndpoint(origin.endpoints[key]);
    }

    this.origin = origin;
  }

  getOrigin(): Origin {
    return this.origin;
  }

  showMenu(e: MouseEvent): any {
    this.element.className = "origin show-endpoints";
    e.preventDefault();
    e.stopPropagation();
    e["originName"] = this.origin.name;
    this.dispatchEvent("show", e);
    return false;
  }

  hideMenu(): any {
    this.element.className = "origin hide-endpoints";
  }

  selectEndpoint(e: Event): any {
    this.hideMenu();
    e["originName"] = this.origin.name;
    this.dispatchEvent("selectEndpoint", e);
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
