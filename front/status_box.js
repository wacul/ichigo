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
        this.keyElement.innerText = origin.name + ": " + origin.endpointKey;
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
})();
