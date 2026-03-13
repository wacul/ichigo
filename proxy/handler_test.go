package proxy

import (
	"bufio"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"net/http/httputil"
	"strings"
	"testing"
)

func newTestHandler(backendURL string) *Handler {
	h := &Handler{
		Origins: []*Origin{
			{
				Name: "front",
				Endpoints: []Endpoint{
					{Key: "local", URL: backendURL},
				},
				EndpointKey: "local",
			},
		},
		Behaviors: []Behavior{
			{PathPrefix: "/", OriginKey: "front"},
		},
		API: API{PathPrefix: "/_proxy"},
	}
	h.origins = map[string]*Origin{}
	for _, o := range h.Origins {
		o.Init()
		h.origins[o.Name] = o
	}
	h.proxy = &httputil.ReverseProxy{Director: h.director}
	return h
}

func TestServeProxy_WebSocketUpgradePassThrough(t *testing.T) {
	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !isWebSocketUpgrade(r) {
			t.Fatalf("request was not treated as websocket upgrade")
		}
		hijacker, ok := w.(http.Hijacker)
		if !ok {
			t.Fatalf("response writer does not support hijack")
		}
		conn, rw, err := hijacker.Hijack()
		if err != nil {
			t.Fatalf("hijack failed: %v", err)
		}
		defer conn.Close()
		if _, err := rw.WriteString(
			"HTTP/1.1 101 Switching Protocols\r\n" +
				"Connection: Upgrade\r\n" +
				"Upgrade: websocket\r\n" +
				"\r\n",
		); err != nil {
			t.Fatalf("write handshake failed: %v", err)
		}
		if err := rw.Flush(); err != nil {
			t.Fatalf("flush handshake failed: %v", err)
		}
	}))
	defer backend.Close()

	handler := newTestHandler(backend.URL)
	proxyServer := httptest.NewServer(handler.controlHandler())
	defer proxyServer.Close()

	addr := strings.TrimPrefix(proxyServer.URL, "http://")
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		t.Fatalf("tcp dial failed: %v", err)
	}
	defer conn.Close()

	req := fmt.Sprintf(
		"GET /hmr HTTP/1.1\r\nHost: %s\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Key: dGVzdA==\r\nSec-WebSocket-Version: 13\r\n\r\n",
		addr,
	)
	if _, err := conn.Write([]byte(req)); err != nil {
		t.Fatalf("write request failed: %v", err)
	}

	reader := bufio.NewReader(conn)
	statusLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("read status line failed: %v", err)
	}
	if !strings.Contains(statusLine, "101") {
		t.Fatalf("unexpected status line: %q", statusLine)
	}
}

func TestServeProxy_InjectsControlAssetsOnHTML(t *testing.T) {
	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = io.WriteString(w, "<html><head></head><body>Hello</body></html>")
	}))
	defer backend.Close()

	handler := newTestHandler(backend.URL)
	proxyServer := httptest.NewServer(handler.controlHandler())
	defer proxyServer.Close()

	resp, err := http.Get(proxyServer.URL + "/")
	if err != nil {
		t.Fatalf("get failed: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read body failed: %v", err)
	}
	text := string(body)
	if !strings.Contains(text, `/_proxy/apiScript.js`) {
		t.Fatalf("script tag was not injected: %s", text)
	}
	if !strings.Contains(text, `/_proxy/apiStyle.css`) {
		t.Fatalf("style tag was not injected: %s", text)
	}
}
