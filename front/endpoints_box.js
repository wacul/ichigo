var EndpointsBox = (function () {
    function EndpointsBox() {
        this.element = document.createElement("table");
        this.element.className = "list-endpoints";
        this.dispatcher = new EventDispatcher();
        this.endpoints = {};
    }
    EndpointsBox.prototype.addEventListener = function (key, listener) { this.dispatcher.addEventListener(key, listener); };
    EndpointsBox.prototype.dispatchEvent = function (key, arg) { this.dispatcher.dispatchEvent(key, arg); };
    EndpointsBox.prototype.removeEventListener = function (key, listener) { this.dispatcher.removeEventListener(key, listener); };
    EndpointsBox.prototype.setEndpoint = function (endpoint) {
        var endpointBox = this.endpoints[endpoint.key];
        if (!endpointBox) {
            endpointBox = new EndpointBox(endpoint);
            endpointBox.put(this.element);
            endpointBox.addEventListener("select", this.select.bind(this));
            this.endpoints[endpoint.key] = endpointBox;
        }
        endpointBox.setEndpoint(endpoint);
    };
    EndpointsBox.prototype.select = function (e) {
        this.dispatchEvent("select", e);
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    EndpointsBox.prototype.clear = function () {
        for (var key in this.endpoints) {
            this.endpoints[key].delete();
        }
        this.endpoints = {};
    };
    EndpointsBox.prototype.put = function (parent) {
        parent.appendChild(this.element);
    };
    EndpointsBox.prototype.delete = function () {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };
    return EndpointsBox;
})();
