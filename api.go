package main

import (
	"./helpers"
	"crypto/md5"
	"strings"
)

func Adduser(msg string) {
	helpers.TRACE.Println("socket.io: adduser", msg)

}

func Logon(msg string) {
	ipNumbers := strings.Split(msg, " ")
	helpers.TRACE.Println("socket.io: Logon", ipNumbers)

	space := md5.Sum([]byte(ipNumbers[0]))
	helpers.TRACE.Println("socket.io: Logon", space)

}
