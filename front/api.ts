interface DoneFunc {
  (response: Origin): void;
}

interface ListDoneFunc {
  (response: Origin[]): void;
}

interface FailFunc {
  (error: Fail): void;
}

interface Fail {
  message: string;
}

interface Endpoint {
    key: string;
    url: string;
}

interface Origin {
    name: string;
    endpoints: Endpoint[];
    endpointKey: string;
    endpointURL: string;
}

class ProxyClient {
  private send(method: string, path: string, body: any): XMLHttpRequest {
    var req = new XMLHttpRequest();
    var url = window["entrypoint"]+path;
    req.open(method, url, true);
    req.setRequestHeader("X-Proxy-Control", "1");
    if (body) {
      req.send(body);
    } else {
      req.send();
    }
    return req;
  }
  private req(method: string, path: string, body: any, done: DoneFunc, fail: FailFunc) {
    var req = this.send(method, path, body);
    req.onload = function(e) {
      if (req.status / 100 > 3) {
        fail(JSON.parse(req.response));
      }
      done(JSON.parse(req.response));
    };
  }

  listOrigins(done: ListDoneFunc, fail: FailFunc){
    var req = this.send("GET", "/origins", null);
    req.onload = function(e) {
      if (req.status / 100 > 3) {
        fail(JSON.parse(req.response));
      }
      done(JSON.parse(req.response));
    };
  }

  updateOrigin(originID: string, endpointKey: string, done: DoneFunc, fail: FailFunc) {
    this.req("PATCH", "/origins/"+originID, JSON.stringify({ "endpointKey": endpointKey }), done, fail);
  }

  getOrigin(originID: string, done: DoneFunc, fail: FailFunc) {
    this.req("GET", "/origins/"+originID, null, done, fail);
  }
}
