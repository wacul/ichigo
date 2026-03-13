class StatusBox {
  private element: HTMLElement;
  // private nameElement: HTMLElement
  private keyElement: HTMLElement;

  private origin: Origin;

  constructor(origin: Origin){
    this.element = document.createElement("div");
    this.element.className = "status";

    // this.nameElement = document.createElement("span")
    // this.nameElement.className = "name"
    // this.element.appendChild(this.nameElement)
    //
    this.keyElement = document.createElement("span");
    this.keyElement.className = "endpoint-key";
    this.element.appendChild(this.keyElement);

    this.setOrigin(origin);
  }

  setOrigin(origin: Origin) {
    if (!origin) {
      return;
    }

    setText(this.keyElement, origin.name + ": " + origin.endpointKey);
    this.keyElement.title = origin.name + ": " + origin.endpointURL;
    this.element.className = "status "+origin.endpointKey;

    this.origin = origin;
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
