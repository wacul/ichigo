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
})();
