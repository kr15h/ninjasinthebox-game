package main

import (
	"./helpers"
	"flag"
	"github.com/googollee/go-socket.io"
	"github.com/gorilla/handlers"
	"github.com/gorilla/pat"
	"log"
	"net/http"
	"os"
	"path"
)

//
// GLOBALS
//
var cfg *helpers.Config
var (
	/*
	  Usage: TRACE.Println(Error Type)
	         ERROR.Println("Couldn't write to file")
	         WARNING.Println("Be careful!\n")
	         INFO.Println("Something good just happened!\n")
	*/

	TRACE  = &helpers.TRACE
	ERROR  = &helpers.ERROR
	WARNIN = &helpers.WARNING
	INFO   = &helpers.INFO
)

func init() {

	// Parse command line switches
	switch_debug := flag.Bool("debug", false, "enable debugging mode")
	switch_conf := flag.String("config", "", "config file location")

	flag.Parse()

	// Read config file
	cfg = new(helpers.Config)

	if *switch_conf != "" {
		cfg.Init(*switch_conf)
	} else {
		configFile := helpers.ConfigFile

		if !path.IsAbs(configFile) {
			basedir, err := os.Getwd()
			if err != nil {
				ERROR.Printf("can't resolve basename: %s", err)
			} else {
				configFile = path.Join(basedir, configFile)
				cfg.Init(configFile)
			}

		}

	}

	// Define log file or use Stdout for debug mode
	if *switch_debug {
		logFile := os.Stdout
		helpers.InitLog(logFile, logFile, logFile, logFile)
	} else {
		logFile, err := os.OpenFile(cfg.Log.LogFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)

		if err != nil {
			log.Fatalln("Failed to open log file ", logFile.Name, ":", err)
		}
		helpers.InitLog(logFile, logFile, logFile, logFile)
	}

	// check if tmpir is absolute, if not make it
	if !path.IsAbs(cfg.Tmp.Tmpdir) {
		basedir, err := os.Getwd()
		if err != nil {
			ERROR.Printf("can't resolve basename: %s", err)
		} else {
			cfg.Tmp.Tmpdir = path.Join(basedir, cfg.Tmp.Tmpdir)
		}
	}

}
func main() {

	// http API
	router := pat.New()

	// http static dir
	router.Add("GET", "/", http.FileServer(http.Dir(cfg.Webserver.Dir)))

	// websockt API
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}

	server.On("connection", func(so socketio.Socket) {
		TRACE.Println("socket.io: connection")
		so.Join("chat")
		so.On("chat message", func(msg string) {
			TRACE.Println("socket.io->emit:", so.Emit("chat message", msg))
			so.BroadcastTo("chat", "chat message", msg)
		})
		so.On("disconnection", func() {
			TRACE.Println("socket.io: disconnect")
		})
		so.On("adduser", func() {
			TRACE.Println("socket.io: adduser")
		})
	})
	server.On("error", func(so socketio.Socket, err error) {
		ERROR.Println("socket.io->error:", err)
	})

	http.Handle("/socket.io/", server)

	// Register this pat with the default serve mux so that other packages
	// may also be exported. (i.e. /debug/pprof[>)
	http.Handle("/", handlers.CombinedLoggingHandler(helpers.LOGFILE, router))

	INFO.Printf("listening on %s:%s", cfg.Webserver.Host, cfg.Webserver.Port)
	err = http.ListenAndServe(cfg.Webserver.Host+":"+cfg.Webserver.Port, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}

}
