#Ninjas in the Box

<img src="https://lh6.googleusercontent.com/-TSBZb_5oiAM/VLKV67LG2yI/AAAAAAAAKAk/Y5NVGLquOFk/w414-h860-no/ninjasinthebox%2Bideas.png" alt="1" width="32%">
<img src="https://lh5.googleusercontent.com/-POE1hhEwskc/VLKV6bh_QkI/AAAAAAAAKAc/3cwwyvIknKc/w413-h861-no/ninjasinthebox%2Bideas%2B%281%29.png" alt="2" width="32%">
<img src="https://lh3.googleusercontent.com/-_1FWbDY2Fzs/VLKV60wsW1I/AAAAAAAAKBE/HpcGFA93rAA/w414-h861-no/ninjasinthebox%2Bideas%2B%282%29.png" alt="3" width="32%">

A game about fighting evil with coding.

This is a project that was made during the koding.io [Global Hackaton](https://koding.com/Hackathon) challenge from Dec 06 to Dec 07 2014.

Our team page can be found [here](https://github.com/silps/global.hackathon/tree/master/Teams/ninjasinthebox).

We also made a video. Click [here](https://www.youtube.com/watch?v=wmLlQKutHAo) to watch it.

## Gameserver documentation


###commit code


### rest API

#### Getters

getSpace


this function will return a json structure holding the space its players and games
```
	getSpace
```
getGame

this function returns the game status don't forget the gameId
```	
	getGame?gameId=2a9ef92d-56c7-416d-bdb3-d5947bc3b46e
```

getMap

download map for game ( mapUrl is listed in every getGame Game.Level[].Map)
```
	getMap?mapUrl=/maps/Level_1.csv
```

gameFinished


deletes the whole space
```
	gameFinished
```


more to come


#### Setters

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

join a game ( gameId is visiable from getSpace )
```
	joinGame?gameId=58b848f0-6be8-4b85-b8f5-dfbbe2711928&userId=a181a363-67c4-4f96-9e62-295079916e2d
```

startGame

start a game ( you need to be the game leader otherwhise it won't work --> the guy who made startGame is the leader)
```
	startGame?gameId=58b848f0-6be8-4b85-b8f5-dfbbe2711928&userId=6b72844b-5551-4c82-b05c-b1e8c07ffd64
```

userMoved

call it allwayes when your user moves, the distance can not be more than one field   
so if you have been last at 4,3 you can be now at 5,3 and so on 
```
	userMoved?gameId=2a9ef92d-56c7-416d-bdb3-d5947bc3b46e&userId=57a6132a-b5d5-4ab3-a8fa-fecedd2aa9d3&x=12&y=4
```

startBribe


start bribing 
```   
      startBribe?gameId=a9ef92d-56c7-416d-bdb3-d5947bc3b46e
```

more to come




	
