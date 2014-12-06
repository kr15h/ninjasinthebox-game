package main

import (
	"./helpers"
	"crypto/md5"
	"encoding/json"
	"github.com/garyburd/redigo/redis"
	"github.com/googollee/go-socket.io"
	"strings"
)

type Space struct {
	subnet []Player
}

type Player struct {
	localIP  string
	userName string
}

func Adduser(msg string) {
	helpers.TRACE.Println("socket.io: adduser", msg)

}

func Logon(msg string) {

	var space Space

	ipNumbers := strings.Split(msg, " ")
	helpers.TRACE.Println("socket.io->Logon: IP", ipNumbers)

	spaceID := md5.Sum([]byte(ipNumbers[1]))
	helpers.TRACE.Println("socket.io->Logon: SpaceID", spaceID)

	redisDB := RedisPool.Get()
	defer redisDB.Close()

	jsonSpace, err := redis.Bytes(redisDB.Do("GET", spaceID))
	if err != nil {

		TRACE.Println("socket.io->Logon: newSpace", err)
		space = Space{
			subnet: []Player{
				{
					localIP:  ipNumbers[0],
					userName: "JonDoe",
				},
			},
		}
		jsonSpace, err := json.Marshal(space)
		if err != nil {
			ERROR.Println("socket.io->Logon JsonMarshal error: ", err)
		}
		_, err = redisDB.Do("SET", "spaceID", jsonSpace)
		if err != nil {
			ERROR.Println("socket.io->Logon Redis Set error: ", err)
		}

	} else {
		err = json.Unmarshal(jsonSpace, &space)
		if err != nil {
			ERROR.Println("socket.io->Logon error: ", err)
		}
	}
	TRACE.Println("socket.io: ", space)
}

func JoinGame(so socketio.Socket, msg string) {

	helpers.TRACE.Println("socket.io: Join", msg)

	so.Emit("channel", "abcde")
}
