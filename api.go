package main

import (
	"./helpers"
	"encoding/json"
	"github.com/garyburd/redigo/redis"
	"github.com/googollee/go-socket.io"
	"strings"
)

type Space struct {
	SpaceID string
	Space   []Player
}

type Player struct {
	LocalIP  string
	UserName string
}

func Adduser(msg string) {
	helpers.TRACE.Println("socket.io: adduser", msg)

}

func Logon(msg string, so socketio.Socket) {

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

	so.Emit("space", space)
}

func JoinGame(so socketio.Socket, msg string) {

	helpers.TRACE.Println("socket.io: Join", msg)

	so.Emit("channel", "abcde")
}
