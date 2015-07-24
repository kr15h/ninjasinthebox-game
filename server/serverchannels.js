var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


// routing
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/html/welcome.html');
});

app.get('/room.html', function (req, res) {
  res.sendFile(__dirname + '/html/room.html');
});

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = [];
var room_id = 0;

io.sockets.on('connection', function (socket) {
    socket.on('getroom', function(){
        socket.emit('initrooms', JSON.stringify(room_id));
    });

    // when the client emits 'adduser', this listens and executes
	socket.on('addroom', function(){
		// store the room name in the socket session for this client
		// rooms[room_id] = room_id;
		/*socket.room = room_id++;
		// add the client's username to the global list
		socket.username = username;
		socket.playerid = 1;
		socket.playercount = 1;
		usernames[username] = username;
		//join room
		//socket.join(socket.room);*/
		room_id++;
		console.log(room_id);
		io.sockets.emit('updaterooms', JSON.stringify(room_id));
		//socket.emit('updaterooms', rooms, 'room1');
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('joinroom', function (data) {
        console.log("joinroom: " + data.room_id + " username: " + data.username);
        console.log(io.sockets.adapter.rooms[data.room_id]);
	    if (typeof(io.sockets.adapter.rooms[data.room_id]) === 'undefined' || io.sockets.adapter.rooms[data.room_id].length <= 2) {
    	    //join a room
    	    socket.join(data.room_id);
    	    socket.room = data.room_id;
    	    //register current user
    	    socket.username = data.username;
    		// we tell the client to execute 'updatechat' with 2 parameters
    		io.to(socket.room).emit('updatechat', 'SERVER', data.username + ' has connected to this room');
	    } else {
	        socket.emit('roomoccupied', 'SERVER', 'room full!');
	    }
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		console.log('user: ' + socket.username + " message: " + data);
		// we tell the client to execute 'updatechat' with 2 parameters
		io.to(socket.room).emit('updatechat', socket.username, data);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		//delete usernames[socket.username];
		// update list of users in chat, client-side
		//io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		console.log('user: ' + socket.username + " disconnected")
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});/**/
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});