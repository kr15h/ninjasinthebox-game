package main

import (
	"./helpers"
	"crypto/md5"
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

	ipNumbers := strings.Split(msg, " ")
	helpers.TRACE.Println("socket.io: Logon", ipNumbers)

	spaceID := md5.Sum([]byte(ipNumbers[1]))
	helpers.TRACE.Println("socket.io: Logon", spaceID)
}
