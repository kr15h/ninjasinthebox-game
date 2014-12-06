package main

import (
	"./helpers"
	"strings"
)

func Adduser(msg string) {
	helpers.TRACE.Println("socket.io: adduser", msg)

}

func Logon(msg string) {
	ipNumbers := strings.Split(msg, " ")
	helpers.TRACE.Println("socket.io: Logon", ipNumbers)
}
