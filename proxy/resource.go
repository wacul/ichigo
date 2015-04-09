package proxy

import (
	"fmt"
	"strings"

	"github.com/wacul/ichigo/asset"
)

const (
	scriptPrefix = "(function(){window['entrypoint']='%s'; "
	scriptSuffix = "})();"
)

func loadAPIScript(entrypoint string) (script []byte, err error) {
	script = []byte(fmt.Sprintf(scriptPrefix, entrypoint))
	for _, name := range asset.AssetNames() {
		if strings.HasSuffix(strings.ToLower(name), ".js") {
			var source []byte
			source, err := asset.Asset(name)
			if err != nil {
				return nil, err
			}
			if source != nil {
				script = append(script, source...)
			}
		}
	}
	script = append(script, []byte(scriptSuffix)...)
	return script, err
}

func loadAPIStyle() (style []byte, err error) {
	for _, name := range asset.AssetNames() {
		if strings.HasSuffix(strings.ToLower(name), ".css") {
			var source []byte
			source, err := asset.Asset(name)
			if err != nil {
				return nil, err
			}
			if source != nil {
				style = append(style, source...)
			}
		}
	}
	return style, err
}
