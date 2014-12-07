package main

import (
	"./helpers"
	"code.google.com/p/go-uuid/uuid"
	"encoding/json"
	"github.com/garyburd/redigo/redis"
	"github.com/googollee/go-socket.io"
	"net/http"
	"strings"
)

type JsonError struct {
	Error string
}

type Space struct {
	Channel string
	SpaceIp string
	Space   []Player
}

type Player struct {
	UserId   string
	UserName string
}

func Adduser(msg string) {
	helpers.TRACE.Println("socket.io: adduser", msg)

}

func Logon(so socketio.Socket, msg string) {

	var space Space
	var known bool = false

	ipNumbers := strings.Split(msg, " ")
	helpers.TRACE.Println("socket.io->Logon: IP", ipNumbers)

	userId := ipNumbers[0]
	spaceIp := ipNumbers[1]
	helpers.TRACE.Println("socket.io->Logon: SpaceIp", spaceIp)

	redisDB := RedisPool.Get()
	defer redisDB.Close()

	jsonSpace, err := redis.Bytes(redisDB.Do("GET", spaceIp))
	if err != nil {
		// so the user is in a new space we add him
		known = true
		TRACE.Println("socket.io->Logon: newSpace", err)
		space = Space{
			Channel: uuid.New(),
			SpaceIp: spaceIp,
			Space: []Player{
				{
					UserId:   uuid.New(),
					UserName: "JonDoe",
				},
			},
		}
		jsonSpace, err := json.Marshal(space)
		if err != nil {
			ERROR.Println("socket.io->Logon json.Marshal error: ", err)
		}
		_, err = redisDB.Do("SET", spaceIp, jsonSpace)
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
		if element.UserId == userId {
			known = true
			TRACE.Println("socket.io->Logon known userId", element.UserId, "in Space", spaceIp)
		}
	}

	// if ip is unknow add it to the space
	if !known {
		TRACE.Println("socket.io->Logon unknown userId", userId, "give him a new one")

		player := Player{
			UserId:   uuid.New(),
			UserName: "JonDoe",
		}

		space.Space = append(space.Space, player)
		jsonSpace, err := json.Marshal(space)
		if err != nil {
			ERROR.Println("socket.io->Logon json.Marshal error: ", err)
		}
		_, err = redisDB.Do("SET", spaceIp, jsonSpace)
		if err != nil {
			ERROR.Println("socket.io->Logon RedisDB SET error: ", err)
		}

		TRACE.Println("socket.io->Logon added", space)
	}

	TRACE.Println("socket.io->Logon Emit Answer with Id", so.Id(), space)
	r := so.Emit("space", space)
	TRACE.Println("socket.io response:", r)
	TRACE.Println("socket.io->Logon Brodcast Answer with Id", so.Id(), space)
	r = so.BroadcastTo("chat", "space", space)
	TRACE.Println("socket.io response:", r)
}

func HttpNewUser(w http.ResponseWriter, r *http.Request) {

	var space Space
	var response interface{}
	var jsonResponse []byte
	var jsonSpace []byte
	var taken bool

	err := r.ParseForm()
	if err != nil {
		ERROR.Println("http-api->NewUser: err", err)
	}

	userName := r.FormValue("userName")
	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->NewUser: IP", spaceIp)

	// check if there was a username provided
	if userName == "" {
		response = JsonError{Error: "missing userName"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->NewUser json.Marshal error: ", err)
		}
	} else {
		redisDB := RedisPool.Get()
		defer redisDB.Close()

		jsonSpace, err = redis.Bytes(redisDB.Do("GET", spaceIp))
		if err != nil {
			// so the user is in a new space we add him
			TRACE.Println("http-api->NewUser: newSpace", err)
			response = Space{
				Channel: uuid.New(),
				SpaceIp: spaceIp,
				Space: []Player{
					{
						UserId:   uuid.New(),
						UserName: userName,
					},
				},
			}
			// prepare response and write it to the database
			jsonResponse, err = json.Marshal(response)
			if err != nil {
				ERROR.Println("socket.io->NewUser json.Marshal error: ", err)
			}
			_, err = redisDB.Do("SET", spaceIp, jsonResponse)
			if err != nil {
				ERROR.Println("socket.io->NewUser RedisDB SET error: ", err)
			}

		} else {
			// space exists
			// else unmarshal the json object
			err = json.Unmarshal(jsonSpace, &space)
			if err != nil {
				ERROR.Println("http-api->NewUser json.Unmarshal error: ", err)
			}

			// check if username is taken
			for _, element := range space.Space {
				if element.UserName == userName {
					taken = true
					TRACE.Println("http-api->NewUser known userId", element.UserId, "in Space", spaceIp)
				}
			}

			if taken {
				// error user exists allready, try an other alias
				response = JsonError{Error: "user exists"}
				jsonResponse, err = json.Marshal(response)
				if err != nil {
					ERROR.Println("socket.io->NewUser json.Marshal error: ", err)
				}
			} else {
				// add user to space
				player := Player{
					UserId:   uuid.New(),
					UserName: userName,
				}

				// add user to json object in database
				space.Space = append(space.Space, player)
				jsonSpace, err := json.Marshal(space)
				if err != nil {
					ERROR.Println("socket.io->NewUser json.Marshal error: ", err)
				}
				_, err = redisDB.Do("SET", spaceIp, jsonSpace)
				if err != nil {
					ERROR.Println("socket.io->NewUser RedisDB SET error: ", err)
				}
				// return onle the new user to the request
				response = Space{
					Channel: uuid.New(),
					SpaceIp: spaceIp,
					Space: []Player{
						player,
					},
				}

				jsonResponse, err = json.Marshal(response)
				if err != nil {
					ERROR.Println("socket.io->NewUser json.Marshal error: ", err)
				}
			}
		}
	}

	TRACE.Println("http-api->NewUser Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func HttpGetUser(w http.ResponseWriter, r *http.Request) {

	var response interface{}
	var jsonResponse []byte

	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->GetUser: IP", spaceIp)

	redisDB := RedisPool.Get()
	defer redisDB.Close()

	response, err := redis.Bytes(redisDB.Do("GET", spaceIp))
	if err != nil {
		// error no space found under spaceIp
		response = JsonError{Error: "no space found, use /newUser?userName=youDude"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->GetUser json.Marshal error: ", err)
		}
	} else {
		// return the space with all the users
		jsonResponse = response.([]byte)
		if err != nil {
			ERROR.Println("socket.io->GetUser json.Marshal error: ", err)
		}
	}

	TRACE.Println("http-api->GetUser Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func JoinGame(so socketio.Socket, msg string) {

	helpers.TRACE.Println("socket.io: Join", msg)

	so.Emit("channel", "abcde")
}
