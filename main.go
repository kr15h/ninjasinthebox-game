package main

import (
	"./helpers"
	"code.google.com/p/go-uuid/uuid"
	"encoding/json"
	"flag"
	"github.com/garyburd/redigo/redis"
	"github.com/googollee/go-socket.io"
	"github.com/gorilla/handlers"
	"github.com/gorilla/pat"
	"log"
	"net/http"
	"os"
	"path"
	"runtime"
	"strings"
)

//
// GLOBALS
//
var cfg *helpers.Config
var RedisPool redis.Pool

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

	// database connection
	runtime.GOMAXPROCS(runtime.NumCPU())
	RedisPool = redis.Pool{
		MaxIdle:   50,
		MaxActive: 500, // max number of connections
		Dial: func() (redis.Conn, error) {
			c, err := redis.Dial("tcp", strings.Join([]string{":", cfg.Database.Port}, ""))
			if err != nil {
				panic(err.Error())
			}
			return c, err
		},
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
		TRACE.Println("socket.io: connection", so.Id())
		so.On("chat message", func(msg string) {
			TRACE.Println("socket.io->emit:", so.Emit("chat message", msg))
			so.BroadcastTo("chat", "chat message", msg)
		})
		so.On("disconnection", func() {
			TRACE.Println("socket.io: disconnect", so.Id(), so.Request())
		})
		so.On("adduser", Adduser)
		so.On("logon", func(so socketio.Socket, msg string) {

			var space Space
			var known bool = false

			ipNumbers := strings.Split(msg, " ")
			helpers.TRACE.Println("socket.io->Logon: IP", ipNumbers)

			localIP := ipNumbers[0]
			spaceID := ipNumbers[1]
			helpers.TRACE.Println("socket.io->Logon: SpaceID", spaceID)

			redisDB := RedisPool.Get()
			defer redisDB.Close()

			jsonSpace, err := redis.Bytes(redisDB.Do("GET", spaceID))
			if err != nil {
				// so the user is in a new space we add him
				known = true
				TRACE.Println("socket.io->Logon: newSpace", err)
				space = Space{
					Channel: uuid.New(),
					SpaceID: spaceID,
					Space: []Player{
						{
							LocalIP:  localIP,
							UserName: "JonDoe",
						},
					},
				}
				jsonSpace, err := json.Marshal(space)
				if err != nil {
					ERROR.Println("socket.io->Logon json.Marshal error: ", err)
				}
				_, err = redisDB.Do("SET", spaceID, jsonSpace)
				if err != nil {
					ERROR.Println("socket.io->Logon RedisDB SET error: ", err)
				}

			} else {
				// else unmarshal the json object
				err = json.Unmarshal(jsonSpace, &space)
				if err != nil {
					ERROR.Println("socket.io->Logon json.Unmarshal error: ", err)
				}
			}

			// check if the user is known
			for _, element := range space.Space {
				if element.LocalIP == localIP {
					known = true
					TRACE.Println("socket.io->Logon known LocalIP", element.LocalIP, "in Space", spaceID)
				}
			}

			// if ip is unknow add it to the space
			if !known {
				TRACE.Println("socket.io->Logon unknown LocalIP", localIP, "is added")

				player := Player{
					LocalIP:  localIP,
					UserName: "JonDoe",
				}

				space.Space = append(space.Space, player)
				jsonSpace, err := json.Marshal(space)
				if err != nil {
					ERROR.Println("socket.io->Logon json.Marshal error: ", err)
				}
				_, err = redisDB.Do("SET", spaceID, jsonSpace)
				if err != nil {
					ERROR.Println("socket.io->Logon RedisDB SET error: ", err)
				}

				TRACE.Println("socket.io->Logon added", space)
			}

			TRACE.Println("socket.io->Logon Emit Answer with Id", so.Id(), space)
			so.Emit("space", space)
			so.BroadcastTo(so.Id(), "space", space)
		})
		so.On("joinGame", JoinGame)

	})
	server.On("error", func(so socketio.Socket, err error) {
		ERROR.Println("socket.io->error:", so.Id(), so.Request(), err)
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
