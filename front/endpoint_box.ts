class EndpointBox {
  private element: HTMLElement
  private nameBox: HTMLElement
  private keyBox: HTMLElement
  private urlBox: HTMLElement
  private endpoint: Endpoint

  private dispatcher: EventDispatcher

  constructor(endpoint: Endpoint){
    this.element = document.createElement("tr")
    this.element.className = "endpoint"

    this.keyBox = document.createElement("td")
    this.keyBox.className = "key"
    this.keyBox.addEventListener("click", this.select.bind(this))
    this.element.appendChild(this.keyBox)

    this.urlBox = document.createElement("td")
    this.urlBox.className = "url"
    this.urlBox.addEventListener("click", this.select.bind(this))
    this.element.appendChild(this.urlBox)

    this.dispatcher = new EventDispatcher()

    this.setEndpoint(endpoint)
  }

  addEventListener(key: string, listener: EventListener) { this.dispatcher.addEventListener(key, listener) }
  dispatchEvent(key: string, arg: Event): any { this.dispatcher.dispatchEvent(key, arg) }
  removeEventListener(key: string, listener: EventListener) { this.dispatcher.removeEventListener(key, listener) }

  setEndpoint(endpoint: Endpoint) {
    if (!endpoint) {
      return
    }

    this.keyBox.innerText = endpoint.key
    this.urlBox.innerText = endpoint.url

    this.endpoint = endpoint
  }

  getEndpoint(): Endpoint {
    return this.endpoint
  }

  select(e: MouseEvent): any {
    e["endpointKey"] = this.endpoint.key
    this.dispatchEvent("select", e)

    e.preventDefault()
    e.stopPropagation()
    return false
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
