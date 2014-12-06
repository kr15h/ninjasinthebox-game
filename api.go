package main

import (
	"./helpers"
	"crypto/md5"
	"encoding/json"
	"github.com/garyburd/redigo/redis"
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
	helpers.TRACE.Println("socket.io: Logon", ipNumbers)

	spaceID := md5.Sum([]byte(ipNumbers[1]))
	helpers.TRACE.Println("socket.io: Logon", spaceID)
	jsonSpace, err := redis.Bytes(RedisDB.Do("GET", spaceID))
	if err != nil {
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
			ERROR.Println("socket.io->Logon error: ", err)
		}
		RedisDB.Do("SET", "spaceID", jsonSpace)
	}
	err = json.Unmarshal(jsonSpace, &space)
	if err != nil {
		ERROR.Println("socket.io->Logon error: ", err)
	}
	TRACE.Println("socket.io: ", space)
}
