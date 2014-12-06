## Gameserver documentation


###commit code


### websockets API



logon	( frontend to backend )

```	
	logon localIP globalIP		----> localIP and globalIP format is 0.0.0.0 the two values are seperated by one space
```	
	
space   ( returned by backend after logon)

```
	space jsonObj			-----> json formated 
	
		 space = Space{
                        Channel: uuid.New(),
                        SpaceID: spaceID,
                        Space: []Player{
                                {
                                        LocalIP:  localIP,
                                        UserName: "JonDoe",
                                },
                        },
                }	
```	
	