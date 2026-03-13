package proxy

import (
	"fmt"
	"strings"
)

const (
	scriptPrefix = "(function(){window['entrypoint']='%s'; "
	scriptSuffix = "})();"
)

func loadAPIScript(entrypoint string) ([]byte, error) {
	script := []byte(fmt.Sprintf(scriptPrefix, entrypoint))
	entries, err := assets.ReadDir("front")
	if err != nil {
		return nil, err
	}
	for _, e := range entries {
		if strings.HasSuffix(strings.ToLower(e.Name()), ".js") {
			src, err := assets.ReadFile("front/" + e.Name())
			if err != nil {
				return nil, err
			}
			script = append(script, src...)
		}
	}
	script = append(script, []byte(scriptSuffix)...)
	return script, nil
}

func loadAPIStyle() ([]byte, error) {
	var style []byte
	entries, err := assets.ReadDir("front")
	if err != nil {
		return nil, err
	}
	for _, e := range entries {
		if strings.HasSuffix(strings.ToLower(e.Name()), ".css") {
			src, err := assets.ReadFile("front/" + e.Name())
			if err != nil {
				return nil, err
			}
			style = append(style, src...)
		}
	}
	return style, nil
}
