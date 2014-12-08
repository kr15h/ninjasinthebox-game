package main

import (
	"./helpers"
	"code.google.com/p/go-uuid/uuid"
	"encoding/csv"
	"encoding/json"
	"github.com/garyburd/redigo/redis"
	"github.com/googollee/go-socket.io"
	"net/http"
	"os"
	"strconv"
	"strings"
)

type JsonError struct {
	Error string
}

type PosVector struct {
	X int
	Y int
}

type Space struct {
	Channel string
	Games   []Game
	SpaceIp string
	Space   []Player
}

type Player struct {
	UserId   string
	UserName string
	Coins    int
	Pos      PosVector
}

type Map struct {
	Coins []PosVector
	Boss  [4]PosVector
}

type Level struct {
	Map        Map
	Timeleft   int16
	Number     int
	CoinsCount int16
}

type Game struct {
	Leader   string
	Running  bool
	Bribeing bool
	Won      bool
	SpaceIp  string
	GameId   string
	Player   []Player
	Level    Level
}

func getCoins(file string) ([]PosVector, error) {

	csvfile, err := os.Open(file)
	if err != nil {
		ERROR.Println("http-api->readCSV:", err)
		return nil, err
	}

	defer csvfile.Close()

	reader := csv.NewReader(csvfile)

	reader.FieldsPerRecord = -1 // see the Reader struct information below

	rawCSVdata, err := reader.ReadAll()

	if err != nil {
		ERROR.Println("http-api->readCSV:", err)
		return nil, err
	}

	pv := []PosVector{}
	for cy, y := range rawCSVdata {
		for cx, x := range y {
			if x == "$" {
				vec := PosVector{
					X: cx - 1,
					Y: cy - 1,
				}
				pv = append(pv, vec)
			}
		}
	}

	return pv, nil
}

func vectorRemoveItem(v []PosVector, item int) []PosVector {
	s := v
	s = append(s[:item], s[item+1:]...)
	return s
}

func HttpStartBribe(w http.ResponseWriter, r *http.Request) {

	var game Game
	var response interface{}
	var jsonResponse []byte
	var jsonGame []byte

	err := r.ParseForm()
	if err != nil {
		ERROR.Println("http-api->UserMoved: err", err)
	}

	gameId := r.FormValue("gameId")
	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->UserMoved: IP", spaceIp)

	if gameId == "" {
		response = JsonError{Error: "missing gameId"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->UserMoved: json.Marshal error: ", err)
		}
	} else {
		redisDB := RedisPool.Get()
		defer redisDB.Close()

		// get the game we have to modify
		jsonGame, err = redis.Bytes(redisDB.Do("GET", gameId))
		err = json.Unmarshal(jsonGame, &game)
		if err != nil {
			ERROR.Println("http-api->UserMoved: json.Unmarshal error: ", err)
		}
		game.Bribeing = true
		response = game

		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("http-api->NewGame: json.Marshal error: ", err)
		}
		_, err = redisDB.Do("SET", response.(Game).GameId, jsonResponse)
		if err != nil {
			ERROR.Println("http-api->NewGame: RedisDB SET error: ", err)
		}

	}

	TRACE.Println("http-api->UserMoved: Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)
}

func HttpGetGame(w http.ResponseWriter, r *http.Request) {

	var game Game
	var response interface{}
	var jsonResponse []byte

	err := r.ParseForm()
	if err != nil {
		ERROR.Println("http-api->UserMoved: err", err)
	}

	gameId := r.FormValue("gameId")
	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->UserMoved: IP", spaceIp)

	if gameId == "" {
		response = JsonError{Error: "missing gameId"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->UserMoved: json.Marshal error: ", err)
		}
	} else {
		redisDB := RedisPool.Get()
		defer redisDB.Close()

		// get the game we have to modify
		jsonResponse, err = redis.Bytes(redisDB.Do("GET", gameId))
		err = json.Unmarshal(jsonResponse, &game)
		if err != nil {
			ERROR.Println("http-api->UserMoved: json.Unmarshal error: ", err)
		}
		response = game
	}

	TRACE.Println("http-api->UserMoved: Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)
}

func HttpUserMoved(w http.ResponseWriter, r *http.Request) {

	var game Game
	var response interface{}
	var jsonResponse []byte
	var jsonGame []byte
	var userHitCoin bool = false

	err := r.ParseForm()
	if err != nil {
		ERROR.Println("http-api->UserMoved: err", err)
	}

	x := r.FormValue("x")
	y := r.FormValue("y")
	userId := r.FormValue("userId")
	gameId := r.FormValue("gameId")
	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->UserMoved: IP", spaceIp)

	if gameId == "" {
		response = JsonError{Error: "missing gameId"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->UserMoved: json.Marshal error: ", err)
		}
	} else if userId == "" {
		response = JsonError{Error: "missing userId"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->UserMoved: json.Marshal error: ", err)
		}
	} else if x == "" {
		response = JsonError{Error: "missing x"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->UserMoved: json.Marshal error: ", err)
		}
	} else if y == "" {
		response = JsonError{Error: "missing y"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->UserMoved: json.Marshal error: ", err)
		}
	} else {
		redisDB := RedisPool.Get()
		defer redisDB.Close()

		// get the game we have to modify
		jsonGame, err = redis.Bytes(redisDB.Do("GET", gameId))
		err = json.Unmarshal(jsonGame, &game)
		if err != nil {
			ERROR.Println("http-api->UserMoved: json.Unmarshal error: ", err)
		}

		// chreck if the user hit a coin
		lx, _ := strconv.Atoi(x)
		ly, _ := strconv.Atoi(y)
		for index, coin := range game.Level.Map.Coins {
			if (coin.X == lx) && (coin.Y == ly) {
				userHitCoin = true
				game.Level.Map.Coins = vectorRemoveItem(game.Level.Map.Coins, index)
			}
		}

		if userHitCoin {
			game.Level.CoinsCount += 1
		}

		// move player
		for item, player := range game.Player {
			if player.UserId == userId {
				TRACE.Println("http-api->UserMoved: found user", userId, lx, ly)
				game.Player[item].Pos.X = lx
				game.Player[item].Pos.Y = ly
				if userHitCoin {
					game.Player[item].Coins += 1
				}
			}
		}

		// write it back to the database
		response = game
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("http-api->UserMoved: json.Marshal error: ", err)
		}
		_, err = redisDB.Do("SET", gameId, jsonResponse)
		if err != nil {
			ERROR.Println("http-api->UserMoved: RedisDB SET error: ", err)
		}
	}

	TRACE.Println("http-api->UserMoved: Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)
}

func HttpStartGame(w http.ResponseWriter, r *http.Request) {

	var game Game
	var response interface{}
	var jsonResponse []byte
	var jsonGame []byte

	err := r.ParseForm()
	if err != nil {
		ERROR.Println("http-api->StartGame: err", err)
	}

	userId := r.FormValue("userId")
	gameId := r.FormValue("gameId")
	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->StartGame: IP", spaceIp)

	if gameId == "" {
		response = JsonError{Error: "missing gameId"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->StartGame: json.Marshal error: ", err)
		}
	} else if userId == "" {
		response = JsonError{Error: "missing userId"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->StartGame: json.Marshal error: ", err)
		}
	} else {
		redisDB := RedisPool.Get()
		defer redisDB.Close()

		// get the space we have to add the game to and unmarshal it
		jsonGame, err = redis.Bytes(redisDB.Do("GET", gameId))
		err = json.Unmarshal(jsonGame, &game)
		if err != nil {
			ERROR.Println("http-api->StartGame: json.Unmarshal error: ", err)
		}

		if game.Leader != userId {
			// well my friend you are not the leader
			response = JsonError{Error: "you are not the leader"}
			jsonResponse, err = json.Marshal(response)
			if err != nil {
				ERROR.Println("socket.io->StartGame: json.Marshal error: ", err)
			}
		} else {
			// ok lets play marshall the game and write it to the database
			game.Running = true
			response = game
			jsonResponse, err = json.Marshal(response)
			if err != nil {
				ERROR.Println("http-api->StartGame: json.Marshal error: ", err)
			}
			_, err = redisDB.Do("SET", gameId, jsonResponse)
			if err != nil {
				ERROR.Println("http-api->StartGame: RedisDB SET error: ", err)
			}
		}
	}

	TRACE.Println("http-api->StartGame: Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)
}

func HttpJoinGame(w http.ResponseWriter, r *http.Request) {

	var space Space
	var game Game
	var response interface{}
	var jsonResponse []byte
	var jsonGame []byte
	var jsonSpace []byte
	var userIsInGame bool = false

	err := r.ParseForm()
	if err != nil {
		ERROR.Println("http-api->JoinGame: err", err)
	}

	userId := r.FormValue("userId")
	gameId := r.FormValue("gameId")
	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->JoinGame: IP", spaceIp)

	if gameId == "" {
		response = JsonError{Error: "missing gameId"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->JoinGame: json.Marshal error: ", err)
		}
	} else if userId == "" {
		response = JsonError{Error: "missing userId"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->JoinGame: json.Marshal error: ", err)
		}
	} else {
		redisDB := RedisPool.Get()
		defer redisDB.Close()

		// get the game we have to add the user to and unmarshal it
		jsonGame, err = redis.Bytes(redisDB.Do("GET", gameId))
		err = json.Unmarshal(jsonGame, &game)
		if err != nil {
			ERROR.Println("http-api->JoinGame: json.Unmarshal error: ", err)
		}

		for _, element := range game.Player {
			if element.UserId == userId {
				userIsInGame = true
			}
		}

		if userIsInGame {
			response = JsonError{Error: "userId is allready registerd for this game"}
			jsonResponse, err = json.Marshal(response)
			if err != nil {
				ERROR.Println("socket.io->JoinGame: json.Marshal error: ", err)
			}
		} else {
			jsonSpace, err = redis.Bytes(redisDB.Do("GET", spaceIp))
			err = json.Unmarshal(jsonSpace, &space)
			if err != nil {
				ERROR.Println("http-api->JoinGame: json.Unmarshal error: ", err)
			}
			// get the player for userId
			var player Player
			for _, element := range space.Space {
				if element.UserId == userId {
					player = element
				}
			}

			if player.UserId == "" {
				// unknown user id
				response = JsonError{Error: "unknown userId"}
				jsonResponse, err = json.Marshal(response)
				if err != nil {
					ERROR.Println("socket.io->JoinGame: json.Marshal error: ", err)
				}
			} else {
				// add the user to the game and write it to the database
				game.Player = append(game.Player, player)
				response = game
				jsonResponse, err = json.Marshal(response)
				if err != nil {
					ERROR.Println("http-api->NewGame: json.Marshal error: ", err)
				}
				_, err = redisDB.Do("SET", gameId, jsonResponse)
				if err != nil {
					ERROR.Println("http-api->NewGame: RedisDB SET error: ", err)
				}
			}

		}

	}

	TRACE.Println("http-api->JoinGame: Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)

}

func HttpNewGame(w http.ResponseWriter, r *http.Request) {

	var space Space
	var response interface{}
	var jsonResponse []byte
	var jsonSpace []byte
	var userHasGame bool = false

	err := r.ParseForm()
	if err != nil {
		ERROR.Println("http-api->NewGame: err", err)
	}

	userId := r.FormValue("userId")
	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->NewGame: IP", spaceIp)

	if userId == "" {
		response = JsonError{Error: "missing userId"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->NewGame: json.Marshal error: ", err)
		}
	} else {
		redisDB := RedisPool.Get()
		defer redisDB.Close()

		// get the space we have to add the game to and unmarshal it
		jsonSpace, err = redis.Bytes(redisDB.Do("GET", spaceIp))
		err = json.Unmarshal(jsonSpace, &space)
		if err != nil {
			ERROR.Println("http-api->NewGame: json.Unmarshal error: ", err)
		}

		// get the player for userId
		var player Player
		for _, element := range space.Space {
			if element.UserId == userId {
				player = element
			}
		}

		for _, element := range space.Games {
			if element.Leader == userId {
				userHasGame = true
			}
		}

		if player.UserId == "" {
			// unknown user id
			response = JsonError{Error: "unknown userId"}
			jsonResponse, err = json.Marshal(response)
			if err != nil {
				ERROR.Println("socket.io->NewGame: json.Marshal error: ", err)
			}
		} else if userHasGame {
			// user has allready started a game
			response = JsonError{Error: "userId has allready started a game"}
			jsonResponse, err = json.Marshal(response)
			if err != nil {
				ERROR.Println("socket.io->NewGame: json.Marshal error: ", err)
			}
		} else {
			// read coins
			coins, err := getCoins("/home/morriswinkler/gameserver/static/maps/Level_1.csv")
			if err != nil {
				ERROR.Println("http-api->StartGame: getCSV error: ", err)
			}

			// create new game
			response = Game{
				Leader:   userId,
				Running:  false,
				Bribeing: false,
				Won:      false,
				SpaceIp:  spaceIp,
				GameId:   uuid.New(),
				Player: []Player{
					player,
				},
				Level: Level{
					Number:     1,
					CoinsCount: 0,
					Map: Map{
						Coins: coins,
					},
				},
			}

			space.Games = append(space.Games, response.(Game))

			// prepare response and write it to the database

			// first the space
			jsonSpace, err = json.Marshal(space)
			if err != nil {
				ERROR.Println("http-api->NewGame: json.Marshal error: ", err)
			}
			_, err = redisDB.Do("SET", spaceIp, jsonSpace)
			if err != nil {
				ERROR.Println("http-api->NewGame: RedisDB SET error: ", err)
			}

			// than the game
			jsonResponse, err = json.Marshal(response)
			if err != nil {
				ERROR.Println("http-api->NewGame: json.Marshal error: ", err)
			}
			_, err = redisDB.Do("SET", response.(Game).GameId, jsonResponse)
			if err != nil {
				ERROR.Println("http-api->NewGame: RedisDB SET error: ", err)
			}
		}
	}

	TRACE.Println("http-api->NewGame: Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)

}

func HttpNewUser(w http.ResponseWriter, r *http.Request) {

	var space Space
	var response interface{}
	var jsonResponse []byte
	var jsonSpace []byte
	var taken bool

	err := r.ParseForm()
	if err != nil {
		ERROR.Println("http-api->NewUser: err", err)
	}

	userName := r.FormValue("userName")
	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->NewUser: IP", spaceIp)

	// check if there was a username provided
	if userName == "" {
		response = JsonError{Error: "missing userName"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->NewUser: json.Marshal error: ", err)
		}
	} else {
		redisDB := RedisPool.Get()
		defer redisDB.Close()

		jsonSpace, err = redis.Bytes(redisDB.Do("GET", spaceIp))
		if err != nil {
			// so the user is in a new space we add him as the leader
			// and create a new space
			TRACE.Println("http-api->NewUser: newSpace", err)
			response = Space{
				Channel: uuid.New(),
				SpaceIp: spaceIp,
				Space: []Player{
					{
						UserId:   uuid.New(),
						UserName: userName,
					},
				},
			}
			// prepare response and write it to the database
			jsonResponse, err = json.Marshal(response)
			if err != nil {
				ERROR.Println("socket.io->NewUser: json.Marshal error: ", err)
			}
			_, err = redisDB.Do("SET", spaceIp, jsonResponse)
			if err != nil {
				ERROR.Println("socket.io->NewUser: RedisDB SET error: ", err)
			}

		} else {
			// space exists
			// else unmarshal the json object
			err = json.Unmarshal(jsonSpace, &space)
			if err != nil {
				ERROR.Println("http-api->NewUser json.Unmarshal: error: ", err)
			}

			// check if username is taken
			for _, element := range space.Space {
				if element.UserName == userName {
					taken = true
					TRACE.Println("http-api->NewUser: known userId", element.UserId, "in Space", spaceIp)
				}
			}

			if taken {
				// error user exists allready, try an other alias
				response = JsonError{Error: "user exists"}
				jsonResponse, err = json.Marshal(response)
				if err != nil {
					ERROR.Println("socket.io->NewUser: json.Marshal error: ", err)
				}
			} else {
				// add user to space
				player := Player{
					UserId:   uuid.New(),
					UserName: userName,
				}

				// add user to json object in database
				space.Space = append(space.Space, player)
				jsonSpace, err := json.Marshal(space)
				if err != nil {
					ERROR.Println("socket.io->NewUser: json.Marshal error: ", err)
				}
				_, err = redisDB.Do("SET", spaceIp, jsonSpace)
				if err != nil {
					ERROR.Println("socket.io->NewUser: RedisDB SET error: ", err)
				}
				// return onle the new user to the request
				response = Space{
					Channel: uuid.New(),
					SpaceIp: spaceIp,
					Space: []Player{
						player,
					},
				}

				jsonResponse, err = json.Marshal(response)
				if err != nil {
					ERROR.Println("socket.io->NewUser: json.Marshal error: ", err)
				}
			}
		}
	}

	TRACE.Println("http-api->NewUser: Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)
}

func HttpGetSpace(w http.ResponseWriter, r *http.Request) {

	var response interface{}
	var jsonResponse []byte

	spaceIp := strings.Split(r.RemoteAddr, ":")[0]
	helpers.TRACE.Println("http-api->GetSpace: IP", spaceIp)

	redisDB := RedisPool.Get()
	defer redisDB.Close()

	response, err := redis.Bytes(redisDB.Do("GET", spaceIp))
	if err != nil {
		// error no space found under spaceIp
		response = JsonError{Error: "no space found, use /newUser?userName=youDude"}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			ERROR.Println("socket.io->GetSpace json.Marshal error: ", err)
		}
	} else {
		// return the space with all the users
		jsonResponse = response.([]byte)
		if err != nil {
			ERROR.Println("socket.io->GetSpace json.Marshal error: ", err)
		}
	}

	TRACE.Println("http-api->GetSpace Answer", response)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonResponse)
}

// historical function fuck websockets, they took me a day and got me nowhere ( whining )
func Logon(so socketio.Socket, msg string) {

	var space Space
	var known bool = false

	ipNumbers := strings.Split(msg, " ")
	helpers.TRACE.Println("socket.io->Logon: IP", ipNumbers)

	userId := ipNumbers[0]
	spaceIp := ipNumbers[1]
	helpers.TRACE.Println("socket.io->Logon: SpaceIp", spaceIp)

	redisDB := RedisPool.Get()
	defer redisDB.Close()

	jsonSpace, err := redis.Bytes(redisDB.Do("GET", spaceIp))
	if err != nil {
		// so the user is in a new space we add him
		known = true
		TRACE.Println("socket.io->Logon: newSpace", err)
		space = Space{
			Channel: uuid.New(),
			SpaceIp: spaceIp,
			Space: []Player{
				{
					UserId:   uuid.New(),
					UserName: "JonDoe",
				},
			},
		}
		jsonSpace, err := json.Marshal(space)
		if err != nil {
			ERROR.Println("socket.io->Logon json.Marshal error: ", err)
		}
		_, err = redisDB.Do("SET", spaceIp, jsonSpace)
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
		if element.UserId == userId {
			known = true
			TRACE.Println("socket.io->Logon known userId", element.UserId, "in Space", spaceIp)
		}
	}

	// if ip is unknow add it to the space
	if !known {
		TRACE.Println("socket.io->Logon unknown userId", userId, "give him a new one")

		player := Player{
			UserId:   uuid.New(),
			UserName: "JonDoe",
		}

		space.Space = append(space.Space, player)
		jsonSpace, err := json.Marshal(space)
		if err != nil {
			ERROR.Println("socket.io->Logon json.Marshal error: ", err)
		}
		_, err = redisDB.Do("SET", spaceIp, jsonSpace)
		if err != nil {
			ERROR.Println("socket.io->Logon RedisDB SET error: ", err)
		}

		TRACE.Println("socket.io->Logon added", space)
	}

	TRACE.Println("socket.io->Logon Emit Answer with Id", so.Id(), space)
	r := so.Emit("space", space)
	TRACE.Println("socket.io response:", r)
	TRACE.Println("socket.io->Logon Brodcast Answer with Id", so.Id(), space)
	r = so.BroadcastTo("chat", "space", space)
	TRACE.Println("socket.io response:", r)
}
