package websocket

import (
	"../../helpers"
)

func Adduser(msg string) {
	helpers.TRACE.Println("socket.io: adduser", msg)

}
