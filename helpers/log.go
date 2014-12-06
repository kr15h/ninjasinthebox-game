package helpers

import (
	"io"
	"log"
)

var (
	TRACE   *log.Logger
	INFO    *log.Logger
	WARNING *log.Logger
	ERROR   *log.Logger
	LOGFILE io.Writer
)

func InitLog(traceHandle io.Writer, infoHandle io.Writer, warningHandle io.Writer, errorHandle io.Writer) {

	/*
	  Usage: TRACE.Println(Error Type)
	         ERROR.Println("Couldn't write to file")
	         WARNING.Println("Be careful!\n")
	         INFO.Println("Something good just happened!\n")
	*/

	TRACE = log.New(traceHandle,
		"TRACE: ",
		log.Ldate|log.Ltime|log.Lshortfile)

	INFO = log.New(infoHandle,
		"INFO: ",
		log.Ldate|log.Ltime|log.Lshortfile)

	WARNING = log.New(warningHandle,
		"WARNING: ",
		log.Ldate|log.Ltime|log.Lshortfile)

	ERROR = log.New(errorHandle,
		"ERROR: ",
		log.Ldate|log.Ltime|log.Lshortfile)

	LOGFILE = errorHandle
}
