var EndpointBox = (function () {
    function EndpointBox(endpoint) {
        this.element = document.createElement("tr");
        this.element.className = "endpoint";
        this.keyBox = document.createElement("td");
        this.keyBox.className = "key";
        this.keyBox.addEventListener("click", this.select.bind(this));
        this.element.appendChild(this.keyBox);
        this.urlBox = document.createElement("td");
        this.urlBox.className = "url";
        this.urlBox.addEventListener("click", this.select.bind(this));
        this.element.appendChild(this.urlBox);
        this.dispatcher = new EventDispatcher();
        this.setEndpoint(endpoint);
    }
    EndpointBox.prototype.addEventListener = function (key, listener) { this.dispatcher.addEventListener(key, listener); };
    EndpointBox.prototype.dispatchEvent = function (key, arg) { this.dispatcher.dispatchEvent(key, arg); };
    EndpointBox.prototype.removeEventListener = function (key, listener) { this.dispatcher.removeEventListener(key, listener); };
    EndpointBox.prototype.setEndpoint = function (endpoint) {
        if (!endpoint) {
            return;
        }
        this.keyBox.innerText = endpoint.key;
        this.urlBox.innerText = endpoint.url;
        this.endpoint = endpoint;
    };
    EndpointBox.prototype.getEndpoint = function () {
        return this.endpoint;
    };
    EndpointBox.prototype.select = function (e) {
        e["endpointKey"] = this.endpoint.key;
        this.dispatchEvent("select", e);
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    EndpointBox.prototype.put = function (parent) {
        parent.appendChild(this.element);
    };
    EndpointBox.prototype.delete = function () {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };
    return EndpointBox;
})();
