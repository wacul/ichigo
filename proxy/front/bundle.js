function setText(dom, text) {
    if ("innerText" in dom) {
        dom["innerText"] = text;
    }
    else if ("textContent" in dom) {
        dom["textContent"] = text;
    }
    else {
        console.error("failed to access dom inner text. textContent and innerText are not able to be accessed");
    }
}
var ProxyClient = (function () {
    function ProxyClient() {
    }
    ProxyClient.prototype.send = function (method, path, body) {
        var req = new XMLHttpRequest();
        var url = window["entrypoint"] + path;
        req.open(method, url, true);
        req.setRequestHeader("X-Proxy-Control", "1");
        if (body) {
            req.send(body);
        }
        else {
            req.send();
        }
        return req;
    };
    ProxyClient.prototype.req = function (method, path, body, done, fail) {
        var req = this.send(method, path, body);
        req.onload = function (e) {
            if (req.status / 100 > 3) {
                fail(JSON.parse(req.responseText));
            }
            done(JSON.parse(req.responseText));
        };
    };
    ProxyClient.prototype.listOrigins = function (done, fail) {
        var req = this.send("GET", "/origins", null);
        req.onload = function (e) {
            if (req.status / 100 > 3) {
                fail(JSON.parse(req.responseText));
            }
            done(JSON.parse(req.responseText));
        };
    };
    ProxyClient.prototype.updateOrigin = function (originID, endpointKey, done, fail) {
        this.req("PATCH", "/origins/" + originID, JSON.stringify({ "endpointKey": endpointKey }), done, fail);
    };
    ProxyClient.prototype.getOrigin = function (originID, done, fail) {
        this.req("GET", "/origins/" + originID, null, done, fail);
    };
    return ProxyClient;
}());
var EventDispatcher = (function () {
    function EventDispatcher() {
        this.events = {};
    }
    EventDispatcher.prototype.addEventListener = function (key, listener) {
        var listeners;
        if (!(key in this.events)) {
            this.events[key] = [];
        }
        listeners = this.events[key];
        listeners.push(listener);
    };
    EventDispatcher.prototype.dispatchEvent = function (key, arg) {
        if (key in this.events) {
            this.events[key].forEach(function (l) { return l(arg); });
        }
    };
    EventDispatcher.prototype.removeEventListener = function (key, listener) {
        if (key in this.events) {
            this.events[key] = this.events[key].filter(function (l) { return l != listener; });
        }
    };
    return EventDispatcher;
}());
var StatusBox = (function () {
    function StatusBox(origin) {
        this.element = document.createElement("div");
        this.element.className = "status";
        this.keyElement = document.createElement("span");
        this.keyElement.className = "endpoint-key";
        this.element.appendChild(this.keyElement);
        this.setOrigin(origin);
    }
    StatusBox.prototype.setOrigin = function (origin) {
        if (!origin) {
            return;
        }
        setText(this.keyElement, origin.name + ": " + origin.endpointKey);
        this.keyElement.title = origin.name + ": " + origin.endpointURL;
        this.element.className = "status " + origin.endpointKey;
        this.origin = origin;
    };
    StatusBox.prototype.put = function (parent) {
        parent.appendChild(this.element);
    };
    StatusBox.prototype.delete = function () {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };
    return StatusBox;
}());
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
        setText(this.keyBox, endpoint.key);
        setText(this.urlBox, endpoint.url);
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
}());
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
}());
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
        setText(this.nameElement, origin.name);
        setText(this.keyElement, origin.endpointKey);
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
}());
var OriginsBox = (function () {
    function OriginsBox() {
        this.element = document.createElement("table");
        this.element.className = "list-origins";
        this.dispatcher = new EventDispatcher();
        this.origins = {};
    }
    OriginsBox.prototype.addEventListener = function (key, listener) { this.dispatcher.addEventListener(key, listener); };
    OriginsBox.prototype.dispatchEvent = function (key, arg) { this.dispatcher.dispatchEvent(key, arg); };
    OriginsBox.prototype.removeEventListener = function (key, listener) { this.dispatcher.removeEventListener(key, listener); };
    OriginsBox.prototype.setOrigin = function (origin) {
        var originBox = this.origins[origin.name];
        if (!originBox) {
            originBox = new OriginBox(origin);
            originBox.put(this.element);
            originBox.addEventListener("show", this.hideMenu.bind(this));
            originBox.addEventListener("selectEndpoint", this.selectEndpoint.bind(this));
            this.origins[origin.name] = originBox;
        }
        originBox.setOrigin(origin);
    };
    OriginsBox.prototype.hideMenu = function (e) {
        for (var name in this.origins) {
            var origin = this.origins[name];
            if (origin.getOrigin().name != e["originName"]) {
                this.origins[name].hideMenu();
            }
        }
    };
    OriginsBox.prototype.selectEndpoint = function (e) {
        this.dispatchEvent("selectEndpoint", e);
    };
    OriginsBox.prototype.clear = function () {
        for (var name in this.origins) {
            this.origins[name].delete();
        }
        this.origins = {};
    };
    OriginsBox.prototype.put = function (parent) {
        parent.appendChild(this.element);
    };
    OriginsBox.prototype.delete = function () {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };
    return OriginsBox;
}());
var Button = (function () {
    function Button() {
        this.element = document.createElement("div");
        this.element.className = "open-button";
        this.element.addEventListener("click", this.open.bind(this));
        this.closeElement = document.createElement("div");
        this.closeElement.className = "close-button";
        this.closeElement.appendChild(document.createTextNode("\u2716"));
        this.closeElement.addEventListener("click", this.close.bind(this));
        this.element.appendChild(this.closeElement);
        this.dispatcher = new EventDispatcher();
        this.statuses = {};
    }
    Button.prototype.addEventListener = function (key, listener) { this.dispatcher.addEventListener(key, listener); };
    Button.prototype.dispatchEvent = function (key, arg) { this.dispatcher.dispatchEvent(key, arg); };
    Button.prototype.removeEventListener = function (key, listener) { this.dispatcher.removeEventListener(key, listener); };
    Button.prototype.setOrigin = function (origin) {
        var statusBox = this.statuses[origin.name];
        if (!statusBox) {
            statusBox = new StatusBox(origin);
            statusBox.put(this.element);
            this.statuses[origin.name] = statusBox;
        }
        statusBox.setOrigin(origin);
    };
    Button.prototype.clearOrigins = function () {
    };
    Button.prototype.open = function (e) {
        this.dispatchEvent("open", e);
    };
    Button.prototype.close = function (e) {
        this.dispatchEvent("close", e);
    };
    Button.prototype.put = function (parent) {
        parent.appendChild(this.element);
    };
    Button.prototype.delete = function () {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };
    return Button;
}());
var ControlBox = (function () {
    function ControlBox() {
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
    ControlBox.prototype.addEventListener = function (key, listener) { this.dispatcher.addEventListener(key, listener); };
    ControlBox.prototype.dispatchEvent = function (key, arg) { this.dispatcher.dispatchEvent(key, arg); };
    ControlBox.prototype.removeEventListener = function (key, listener) { this.dispatcher.removeEventListener(key, listener); };
    ControlBox.prototype.setOrigin = function (origin) {
        this.originsBox.setOrigin(origin);
        this.button.setOrigin(origin);
    };
    ControlBox.prototype.clearOrigins = function () {
        this.originsBox.clear();
    };
    ControlBox.prototype.selectEndpoint = function (e) {
        this.dispatchEvent("selectEndpoint", e);
    };
    ControlBox.prototype.showMenu = function (e) {
        this.element.className = "ichigo-controller-box show-origins";
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    ControlBox.prototype.close = function (e) {
        this.element.className = "ichigo-controller-box closed";
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    ControlBox.prototype.hideMenu = function (e) {
        this.element.className = "ichigo-controller-box hide-origins";
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    ControlBox.prototype.put = function (parent) {
        parent.appendChild(this.element);
    };
    ControlBox.prototype.delete = function () {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };
    return ControlBox;
}());
window.addEventListener("load", function (e) {
    var proxyClient = new ProxyClient();
    var box = new ControlBox();
    box.addEventListener("selectEndpoint", function (e) {
        proxyClient.updateOrigin(e["originName"], e["endpointKey"], function (origin) {
            box.setOrigin(origin);
            location.reload();
        }, function (err) {
            console.error(err);
        });
    });
    proxyClient.listOrigins(function (origins) {
        for (var key in origins) {
            box.setOrigin(origins[key]);
        }
        box.put(document.body);
    }, function (err) {
        console.error(err);
    });
});
