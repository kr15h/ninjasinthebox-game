package main

import (
	"./helpers"
	"encoding/json"
	"github.com/garyburd/redigo/redis"
	"github.com/googollee/go-socket.io"
	"strings"
)

type Space struct {
	Subnet []Player
}

type Player struct {
	LocalIP  string
	UserName string
}

func Adduser(msg string) {
	helpers.TRACE.Println("socket.io: adduser", msg)

}

func Logon(msg string) {

	var space Space

	ipNumbers := strings.Split(msg, " ")
	helpers.TRACE.Println("socket.io->Logon: IP", ipNumbers)

	spaceID := ipNumbers[1]
	helpers.TRACE.Println("socket.io->Logon: SpaceID", spaceID)

	redisDB := RedisPool.Get()
	defer redisDB.Close()

	jsonSpace, err := redis.String(redisDB.Do("GET", spaceID))
	if err != nil {

		TRACE.Println("socket.io->Logon: newSpace", err)
		space = Space{
			Subnet: []Player{
				{
					LocalIP:  ipNumbers[0],
					UserName: "JonDoe",
				},
			},
		}
		jsonSpace, err := json.Marshal(space)
		if err != nil {
			ERROR.Println("socket.io->Logon json.Marshal error: ", err)
		}
		_, err = redisDB.Do("SET", spaceID, string(jsonSpace))
		if err != nil {
			ERROR.Println("socket.io->Logon RedisDB SET error: ", err)
		}

	} else {
		err = json.Unmarshal([]byte(jsonSpace), &space)
		if err != nil {
			ERROR.Println("socket.io->Logon json.Unmarshal error: ", err)
		}
	}

	TRACE.Println("socket.io->Logon Result: ", space)
}

func JoinGame(so socketio.Socket, msg string) {

	helpers.TRACE.Println("socket.io: Join", msg)

	so.Emit("channel", "abcde")
}
