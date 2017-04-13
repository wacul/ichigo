package proxy

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"net/http/httputil"
	"net/url"
	"strconv"
	"strings"

	"github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
)

// Handler : リバースプロキシ
type Handler struct {
	Origins   []*Origin  `json:"origins" yaml:"origins"`
	Behaviors []Behavior `json:"behaviors" yaml:"behaviors"`
	Addr      string     `json:"-" yaml:"addr"`
	API       API        `json:"-" yaml:"api"`

	StartPath   string `json:"-" yaml:"startPath"`
	HideControl bool   `json:"-" yaml:"hideControl"`

	origins    map[string]*Origin
	proxy      *httputil.ReverseProxy
	controller http.Handler
	apiScript  []byte
	apiStyle   []byte
}

// Behavior : パスごとのプロキシ先設定
type Behavior struct {
	PathPrefix string `json:"pathPrefix" yaml:"pathPrefix"`
	OriginKey  string `json:"originKey" yaml:"originKey"`
}

// API : コントロールの設定
type API struct {
	PathPrefix string `json:"-" yaml:"pathPrefix"`
}

const (
	// BehaviorStatusFound : プロキシの宛先が見つかった
	BehaviorStatusFound = "found"
	// BehaviorStatusNotFound : プロキシの宛先が見つからなった
	BehaviorStatusNotFound = "notfound"
)

const (
	// ProxyHeaderBehavior : プロキシの結果を格納するヘッダの名前
	ProxyHeaderBehavior = "X-Proxy-Behavior"
	// ProxyHeaderControl : プロキシのコントローラを呼び出すためのヘッダの名前
	ProxyHeaderControl = "X-Proxy-Control"
)

// ListenAndServe : サーバーを起動する
func (h *Handler) ListenAndServe() error {
	h.proxy = &httputil.ReverseProxy{Director: h.director}
	h.controller = h.controlHandler()
	h.origins = map[string]*Origin{}
	for _, o := range h.Origins {
		o.Init()
		h.origins[o.Name] = o
	}
	script, err := loadAPIScript(h.API.PathPrefix)
	if err != nil {
		return err
	}
	style, err := loadAPIStyle()
	if err != nil {
		return err
	}
	h.apiScript = script
	h.apiStyle = style
	logrus.Infoln("proxy running on", h.Addr)
	return http.ListenAndServe(h.Addr, h.controller)
}

func (h *Handler) controlHandler() http.Handler {
	router := mux.NewRouter()
	router.Methods("GET").Path(h.API.PathPrefix + "/origins").Handler(h.getHTTPHandler(h.listOrigins))
	router.Methods("PATCH").Path(h.API.PathPrefix + "/origins/{originID}").Handler(h.getOriginHTTPHandler(h.updateOrigin))
	router.Methods("GET").Path(h.API.PathPrefix + "/origins/{originID}").Handler(h.getOriginHTTPHandler(nil))
	router.Methods("GET").Path(h.API.PathPrefix + "/apiScript.js").HandlerFunc(h.serveAPIScript)
	router.Methods("GET").Path(h.API.PathPrefix + "/apiStyle.css").HandlerFunc(h.serveAPIStyle)
	router.PathPrefix("/").HandlerFunc(h.serveProxy)
	return router
}

func (h *Handler) serveAPIScript(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/javascript")
	w.Write(h.apiScript)
	// script, _ := loadAPIScript(h.API.PathPrefix)
	// w.Write(script)
}

func (h *Handler) serveAPIStyle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/css")
	w.Write(h.apiStyle)
	// style, _ := loadAPIStyle()
	// w.Write(style)
}

func (h *Handler) listOrigins(r *http.Request) (interface{}, error) {
	return h.Origins, nil
}

func (h *Handler) updateOrigin(origin *Origin, r *http.Request) error {
	values := map[string]string{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&values)
	if err != nil {
		return err
	}
	origin.Select(values["endpointKey"])
	return nil
}

func (h *Handler) getHTTPHandler(method func(r *http.Request) (interface{}, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		res, err := method(r)
		w.Header().Set("Content-Type", "application/json")
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			message, _ := json.Marshal(map[string]string{"message": err.Error()})
			w.Write(message)
		} else if res != nil {
			body, err := json.Marshal(res)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				message, _ := json.Marshal(map[string]string{"message": err.Error()})
				w.Write(message)
			} else {
				w.Write(body)
			}
		}
	}
}

func (h *Handler) getOrigin(r *http.Request) (*Origin, error) {
	if r == nil {
		return nil, errors.New("")
	}
	vars := mux.Vars(r)
	id, ok := vars["originID"]
	if !ok {
		return nil, errors.New("")
	}
	origin, ok := h.origins[id]
	if !ok {
		return nil, errors.New("")
	}
	return origin, nil
}

func (h *Handler) getOriginHTTPHandler(method func(origin *Origin, r *http.Request) error) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		o, err := h.getOrigin(r)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		handler := h.getHTTPHandler(func(r *http.Request) (interface{}, error) {
			var err error
			if method != nil {
				err = method(o, r)
			}
			return o, err
		})
		handler(w, r)
	}
}

func (h *Handler) serveProxy(w http.ResponseWriter, r *http.Request) {
	rec := httptest.NewRecorder()
	h.proxy.ServeHTTP(rec, r)

	var containsHeader = false

	// copy headers
	for k, v := range rec.Header() {
		containsHeader = true
		if k != "Content-Length" && k != "Content-Encoding" {
			w.Header()[k] = v
		}
	}
	encoding := rec.Header().Get("Content-Encoding")

	var content []byte
	scriptBody := `<script type="text/javascript" src="` + h.API.PathPrefix + `/apiScript.js"></script>`
	styleBody := `<link type="text/css" rel="stylesheet" href="` + h.API.PathPrefix + `/apiStyle.css"/>`

	if rec.Code == http.StatusInternalServerError && !containsHeader {
		rec.Header().Set("Content-Type", "text/html")
		content = []byte("<html><head>" + scriptBody + styleBody + "</head><body>500</body></html>")
	} else {
		// append controller
		contentType := rec.Header().Get("Content-Type")

		hideControl := false
		if h.HideControl {
			hideControl = true
		} else if r.URL != nil {
			if q := r.URL.Query(); q != nil {
				if _, ok := q["__ichigo__hide__control"]; ok {
					hideControl = true
				}
			}
		}

		if (contentType == "text/html" || strings.HasPrefix(contentType, "text/html;")) && !hideControl {
			if encoding == "gzip" {
				reader, err := gzip.NewReader(rec.Body)
				if err == nil {
					content, err = ioutil.ReadAll(reader)
					if err == nil {
						encoding = ""
					} else {
						content = rec.Body.Bytes()
					}
				} else {
					content = rec.Body.Bytes()
				}
			} else {
				content = rec.Body.Bytes()
			}

			content = bytes.Replace(content, []byte("</body>"), []byte(scriptBody+`</body>`), 1)
			content = bytes.Replace(content, []byte("</head>"), []byte(styleBody+`</head>`), 1)
		} else {
			content = rec.Body.Bytes()
		}
	}
	// set content length
	w.Header().Set("Content-Length", strconv.Itoa(len(content)))
	if encoding != "" {
		w.Header().Set("Content-Encoding", encoding)
	}

	// status code
	w.WriteHeader(rec.Code)

	// write out
	_, err := w.Write(content)
	if err != nil {
		logrus.Println(err)
	}
}

func (h *Handler) director(request *http.Request) {
	for _, b := range h.Behaviors {
		if strings.HasPrefix(request.URL.Path, b.PathPrefix) {
			origin, ok := h.origins[b.OriginKey]
			if ok {
				// URLを変更する
				dst, parseErr := url.Parse(origin.EndpointURL)
				if parseErr != nil {
					logrus.Errorln(parseErr.Error())
					continue
				}
				url := *request.URL
				url.Scheme = dst.Scheme
				url.Host = dst.Host

				// ヘッダの中身がBodyに含まれているとダメなので、Body部分だけのバッファに一旦落とす
				var buffer []byte
				if request.Body != nil {
					buf, err := ioutil.ReadAll(request.Body)
					if err != nil {
						logrus.Errorln(err.Error())
						continue
					}
					buffer = buf
				}
				// 新しいリクエストを組み立てる
				req, err := http.NewRequest(request.Method, url.String(), bytes.NewBuffer(buffer))
				if err != nil {
					logrus.Errorln(err.Error())
					continue
				}
				req.Header = request.Header
				*request = *req
				return
			}
		}
	}
	request.Header.Set(ProxyHeaderBehavior, BehaviorStatusNotFound)
}
