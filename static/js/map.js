// Map class

function Map(rows, cols) {
    this.rows = rows || 10;
	this.cols = cols ||  10;
	this.container = {};

	this.walls = [];
    this.coins = [];
	this.players = [];
}

Map.prototype.setup = function(jQueryContainerObject) {
	if (arguments.length) {
		this.container = jQueryContainerObject;
	} else {
		console.log('Map.setup(): No object specified.');
	}
};

Map.prototype.loadMap = function(fileUrl) {
	console.log(fileUrl);
	this.createHtml();
};

Map.prototype.createHtml = function(cols, rows) {
	if (arguments.length) {
		this.cols = cols;
		this.rows = rows;
	}
	
	var tableHtml = '';
	tableHtml += '<table>';

	for (var rowsIter = 0; rowsIter < this.rows; rowsIter++) {
		tableHtml += '<tr>';
		for (var colsIter = 0; colsIter < this.cols; colsIter++) {
			tableHtml += '<td></td>';
		}
		tableHtml += '</tr>';
	}

	tableHtml += '</table>';

	this.container.empty();
	this.container.append(tableHtml);

	this.calcSize();
};

Map.prototype.calcSize = function() {
	var containerWidth = this.container.width();
	var cellWidth = containerWidth / this.cols;
	var cellHeight = Math.floor(cellWidth);
	$('td').css('height', String(cellHeight) + 'px');
};

Map.prototype.addWall = function(wall, x, y) {
    if (y > this.rows || x > this.cols || y < 0 || x < 0) {
        console.log("Map.addWall(): No such cell in grid.");
        return;
    }
    this.walls.push(wall);
    var element = $('td').eq((this.cols * y) + x);
    element.append(wall.element);
};

Map.prototype.addCoin = function(coin, x, y) {
    if (y > this.rows || x > this.cols || y < 0 || x < 0) {
        console.log("Map.addPlayer(): No such cell in grid.");
        return;
    }
    this.coins.push(coin);
    var element = $('td').eq((this.cols * y) + x);
    element.append(coin.element);
};

Map.prototype.addPlayer = function(player, x, y) {
    if (y > this.rows || x > this.cols || y < 0 || x < 0) {
        console.log("Map.addPlayer(): No such cell in grid.");
        return;
    }
    player.x = x;
    player.y = y;
    this.players.push(player);
    var element = $('td').eq((this.cols * y) + x);
    element.append(player.element);
};

Map.prototype.movePlayer = function(player, dir) {
    /* check for collision with items */
    var x = player.x, y = player.y;
    if (dir === "up") {
        y -= 1;
    } else if (dir === "left") {
        x -= 1;
    } else if (dir === "right") {
        x += 1;
    } else {
        y += 1;
    }
    $('td').eq((this.cols * player.y) + player.x).empty();
    var element = $('td').eq((this.cols * y) + x);
    element.append(player.element);
};

// Player class

function Player(imgSrc) {
    this.x;
    this.y;
    this.coins = 0;
    this.rotation = 0;
    this.imgSrc = imgSrc || 'media/ninja.png';
    this.element = this.createHtml();
}

Player.prototype.createHtml = function() {
    var element = document.createElement('img');
    element.src = this.imgSrc;
    element.alt = "Player";
    console.log(element);
    return element;
};

/*
Player.prototype.move = function(dir) {
    if (this.rotation == 0) {
        if (dir === "backward") this.y += this.step;
        else this.y -= this.step;
    } else if (this.rotation == 90) {
        if (dir === "backward") this.x -= this.step;
        else this.x += this.step;
    } else if (this.rotation == 180) {
        if (dir === "backward") this.y -= this.step;
        else this.y += this.step;
    } else {
        if (dir === "backward") this.x += this.step;
        else this.x -= this.step;
    }
    document.getElementById("player").style.marginTop = this.y+"px";
    document.getElementById("player").style.marginLeft = this.x+"px";
};
*/

Player.prototype.turn = function(dir) {
    if (dir === "left") {
        this.rotation -= 90;
        if (this.rotation < 0) this.rotation = 270;
    } else {
        this.rotation += 90;
        if (this.rotation > 270) this.rotation = 0;
    }
    this.element.className = "rotate"+this.rotation;
};


// This test

$(document).ready(function() {
	var map = new Map();
	map.setup($('#map-container'));
	map.loadMap("lorem.json");
	map.createHtml();

	var player = new Player();
	map.addPlayer(player, 1, 1);
    map.movePlayer(player, "right");

	$(window).resize(function() {
		map.calcSize();
	});
});
