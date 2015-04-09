var OriginBox = (function () {
    function OriginBox(origin) {
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
    OriginBox.prototype.addEventListener = function (key, listener) { this.dispatcher.addEventListener(key, listener); };
    OriginBox.prototype.dispatchEvent = function (key, arg) { this.dispatcher.dispatchEvent(key, arg); };
    OriginBox.prototype.removeEventListener = function (key, listener) { this.dispatcher.removeEventListener(key, listener); };
    OriginBox.prototype.setOrigin = function (origin) {
        if (!origin) {
            return;
        }
        this.nameElement.innerText = origin.name;
        this.keyElement.innerText = origin.endpointKey;
        this.keyElement.className = "endpoint-key " + origin.endpointKey;
        this.keyElement.title = origin.endpointURL;
        if (origin.endpoints && origin.endpoints.length > 1) {
            this.keyElement.className += " selectable";
        }
        for (var key in origin.endpoints) {
            this.endpoints.setEndpoint(origin.endpoints[key]);
        }
        this.origin = origin;
    };
    OriginBox.prototype.getOrigin = function () {
        return this.origin;
    };
    OriginBox.prototype.showMenu = function (e) {
        this.element.className = "origin show-endpoints";
        e.preventDefault();
        e.stopPropagation();
        e["originName"] = this.origin.name;
        this.dispatchEvent("show", e);
        return false;
    };
    OriginBox.prototype.hideMenu = function () {
        this.element.className = "origin hide-endpoints";
    };
    OriginBox.prototype.selectEndpoint = function (e) {
        this.hideMenu();
        e["originName"] = this.origin.name;
        this.dispatchEvent("selectEndpoint", e);
    };
    OriginBox.prototype.put = function (parent) {
        parent.appendChild(this.element);
    };
    OriginBox.prototype.delete = function () {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };
    return OriginBox;
})();
