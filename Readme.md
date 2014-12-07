## Gameserver documentation


###commit code


### rest API

#### Getters

getSpace


this function will return a json structure holding the space its players and games
```
	getSpace
```

more to come


newUser 

create a new user in your space ( space is predefined by your srcIP arriving on the server )
```
	newUser?userName=someName

```

newGame 

crate a new game ( you got your userId from newUser )
```
	newGame?userId=6b72844b-5551-4c82-b05c-b1e8c07ffd64
```

joinGame

join a game ( gameId is visiable from getSpace =
```
	joinGame?gameId=58b848f0-6be8-4b85-b8f5-dfbbe2711928&userId=a181a363-67c4-4f96-9e62-295079916e2d
```

sratGame

start a game ( you need to be the game leader otherwhise it won't work --> the guy who made startGame is the leader)
```
	startGame?gameId=58b848f0-6be8-4b85-b8f5-dfbbe2711928&userId=6b72844b-5551-4c82-b05c-b1e8c07ffd64
```

more to come




	