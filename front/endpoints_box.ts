class EndpointsBox {
  private element: HTMLElement
  private endpoints: { [key: string]: EndpointBox; }

  private dispatcher: EventDispatcher

  constructor(){
    this.element = document.createElement("table")
    this.element.className = "list-endpoints"

    this.dispatcher = new EventDispatcher()

    this.endpoints = {};
  }

  addEventListener(key: string, listener: EventListener) { this.dispatcher.addEventListener(key, listener) }
  dispatchEvent(key: string, arg: Event): any { this.dispatcher.dispatchEvent(key, arg) }
  removeEventListener(key: string, listener: EventListener) { this.dispatcher.removeEventListener(key, listener) }

  setEndpoint(endpoint: Endpoint) {
    var endpointBox = this.endpoints[endpoint.key]
    if (!endpointBox) {
      endpointBox = new EndpointBox(endpoint)
      endpointBox.put(this.element)
      endpointBox.addEventListener("select", this.select.bind(this))

      this.endpoints[endpoint.key] = endpointBox
    }
    endpointBox.setEndpoint(endpoint)
  }

  select(e: MouseEvent): any {
    this.dispatchEvent("select", e)

    e.preventDefault()
    e.stopPropagation()
    return false
  }

  clear() {
    for (var key in this.endpoints) {
      this.endpoints[key].delete()
    }
    this.endpoints = {}
  }

  put(parent: HTMLElement){
    parent.appendChild(this.element)
  }

  delete() {
    if (this.element && this.element.parentNode){
      this.element.parentNode.removeChild(this.element)
    }
  }
}
