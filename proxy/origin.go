package proxy

import "sync"

// Origin : プロキシ先の設定
type Origin struct {
	Name      string     `json:"name" yaml:"name"`
	Endpoints []Endpoint `json:"endpoints" yaml:"endpoints"`

	EndpointKey string `json:"endpointKey" yaml:"endpointKey"`
	EndpointURL string `json:"endpointURL" yaml:"-"`

	keys []string
	urls map[string]string
	once sync.Once
}

type Endpoint struct {
	Key string `json:"key" yaml:"key"`
	URL string `json:"url" yaml:"url"`
}

func (o *Origin) Init() {
	o.once.Do(func() {
		o.urls = map[string]string{}

		o.keys = make([]string, len(o.Endpoints))
		for i, e := range o.Endpoints {
			o.keys[i] = e.Key
			o.urls[e.Key] = e.URL
		}
		var ok bool
		o.EndpointURL, ok = o.urls[o.EndpointKey]
		if !ok {
			o.EndpointKey = o.Endpoints[0].Key
			o.EndpointURL = o.Endpoints[0].URL
		}
	})
}

func (o *Origin) Select(key string) bool {
	o.Init()
	new, ok := o.urls[key]
	if ok {
		o.EndpointKey = key
		o.EndpointURL = new
	}
	return ok
}
