package proxy

import "embed"

//go:embed front/bundle.js front/layout.css
var assets embed.FS
