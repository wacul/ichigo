var ControlBox = (function () {
    function ControlBox() {
        this.element = document.createElement("div");
        this.element.className = "control-box hide-origins";
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
        this.element.className = "control-box show-origins";
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    ControlBox.prototype.close = function (e) {
        this.element.className = "control-box closed";
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    ControlBox.prototype.hideMenu = function (e) {
        this.element.className = "control-box hide-origins";
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
})();
