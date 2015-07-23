package main

//go:generate npm install
//go:generate gulp scripts
//go:generate go-bindata -ignore=\\.DS_Store -ignore=\\.#.* -o asset/asset.go  -pkg asset  -prefix front front/...

import (
	"io/ioutil"
	"os"
	"time"

	"github.com/Sirupsen/logrus"
	"github.com/skratchdot/open-golang/open"
	"github.com/wacul/ichigo/proxy"
	kingpin "gopkg.in/alecthomas/kingpin.v1"
	yaml "gopkg.in/yaml.v2"
)

const (
	// ConfigFile : 設定ファイル名
	ConfigFile = "ichigo.yaml"
)

func main() {
	app := kingpin.New("Ichigo", "Reverse proxy for development")
	app.Version("1.0.0")
	configFile := app.Flag("config", "A file contains configurations (YAML)").Short('c').Default(ConfigFile).ExistingFile()
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

	go func() {
		time.Sleep(1 * time.Second)
		open.Start("http://localhost" + handler.Addr)
	}()
	logrus.Println(handler.ListenAndServe())
}
