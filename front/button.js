var Button = (function () {
    function Button() {
        this.element = document.createElement("div");
        this.element.className = "open-button";
        this.element.addEventListener("click", this.open.bind(this));
        this.closeElement = document.createElement("div");
        this.closeElement.className = "close-button";
        this.closeElement.appendChild(document.createTextNode("\u26D4"));
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
})();
