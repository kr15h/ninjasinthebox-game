// Main config package for bitstoatoms
package helpers

import (
	"code.google.com/p/gcfg"
	"log"
)

// config file location
const ConfigFile string = "config.ini"

// Main configuration struct
type Config struct {
	Log struct {
		LogFile string
	}

	Tmp struct {
		Tmpdir string
	}

	Database struct {
		Host, Port, Username, Password, DBName string
	}

	Webserver struct {
		Host, Port, Dir, BaseURL string
	}
}

// Loads and parses config ini file
func (c *Config) Init(configFile string) {
	err := gcfg.ReadFileInto(c, configFile)
	if err != nil {
		log.Fatalln("Failed to open config file ", configFile, ":", err)
	}
}
