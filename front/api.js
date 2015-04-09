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
                fail(JSON.parse(req.response));
            }
            done(JSON.parse(req.response));
        };
    };
    ProxyClient.prototype.listOrigins = function (done, fail) {
        var req = this.send("GET", "/origins", null);
        req.onload = function (e) {
            if (req.status / 100 > 3) {
                fail(JSON.parse(req.response));
            }
            done(JSON.parse(req.response));
        };
    };
    ProxyClient.prototype.updateOrigin = function (originID, endpointKey, done, fail) {
        this.req("PATCH", "/origins/" + originID, JSON.stringify({ "endpointKey": endpointKey }), done, fail);
    };
    ProxyClient.prototype.getOrigin = function (originID, done, fail) {
        this.req("GET", "/origins/" + originID, null, done, fail);
    };
    return ProxyClient;
})();
