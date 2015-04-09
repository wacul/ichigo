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
})();
