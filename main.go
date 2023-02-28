package main

//go:generate npm install
//go:generate gulp scripts
//go:generate go-bindata -ignore=\\.DS_Store -ignore=\\.#.* -o asset/asset.go  -pkg asset  -prefix front front/...

import (
	"io/ioutil"
	"os"
	"time"

	kingpin "github.com/alecthomas/kingpin/v2"
	"github.com/sirupsen/logrus"
	"github.com/skratchdot/open-golang/open"
	"github.com/wacul/ichigo/proxy"
	yaml "gopkg.in/yaml.v2"
)

const (
	// ConfigFile : 設定ファイル名
	ConfigFile = "ichigo.yaml"
)

var version = "snapshot"

func main() {
	app := kingpin.New("Ichigo", "Reverse proxy for development")
	app.Version(version)
	configFile := app.Flag("config", "A file contains configurations (YAML)").Short('c').Default(ConfigFile).ExistingFile()
	dontOpen := app.Flag("no-browser", "Supresss to open browser automatically").Short('n').Default("false").Bool()

	_, err := app.Parse(os.Args[1:])
	if err != nil {
		logrus.Fatalln(err.Error())
	}

	logrus.SetLevel(logrus.DebugLevel)
	confBytes, err := ioutil.ReadFile(*configFile)
	if err != nil {
		logrus.Fatalln(err.Error())
	}

	var handler proxy.Handler
	err = yaml.Unmarshal(confBytes, &handler)
	if err != nil {
		logrus.Fatalln(err.Error())
	}

	if dontOpen == nil || !*dontOpen {
		go func() {
			time.Sleep(1 * time.Second)
			if err := open.Start("http://localhost" + handler.Addr + handler.StartPath); err != nil {
				panic(err)
			}
		}()
	}
	logrus.Println(handler.ListenAndServe())
}
