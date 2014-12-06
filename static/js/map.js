// Map class

function Map(rows, cols) {
    this.rows = rows || 10;
	this.cols = cols || 10;
	this.container = {};

    /* create the objects matrix */
    this.objects = [];
    for(var i = 0; i < this.rows; i++) {
        this.objects[i] = new Array(this.cols);
    }
    /* just for convenience */
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

Map.prototype.addObject = function(object, x, y) {
    if (y > this.rows || x > this.cols || y < 0 || x < 0) {
        console.log("Map.addPlayer(): No such cell in grid.");
        return;
    }
    object.x = x;
    object.y = y;
    /* add to object matrix */
    this.objects[x][y] = object;
    /* when player, push also to players, for convenience */
    if (object.type === "player") this.players.push(object);
    /* add to the specified table cell */
    var element = $('td').eq((this.cols * y) + x);
    element.append(object.element);
};

Map.prototype.moveObject = function(object) {
    /* see where the player needs to be moved */
    var x = object.x, y = object.y;
    if (object.rotation == 0) {
        y += 1;
    } else if (object.rotation == 90) {
        x += 1;
    } else if (object.roation == 180) {
        y -= 1;
    } else {
        x -= 1;
    }
    /* check for map borders */
    if (x < 0 || y < 0 || x > this.cols - 1 || y > this.rows - 1) {
        /* trying to escape map */
        alert("trying to escape maze");
        /* ?..? */
        return;
    }
    /* check for collision */
    var obj = this.objects[x][y];
    if (typeof(obj) !== 'undefined') {
        /* collision with an object occured */
        /* check what type of object it is */
        alert("collision with [" + obj.type + "] occured");
        /* collision is only ok with coins */
        if (obj.type === "coin") {
            /* collect the coin */
        } else {
            /* ?..? */
            return;
        }
    }
    /* clear the previouse table cell and object matrix slot */
    this.objects[object.x][object.y] = 'undefined';
    $('td').eq((this.cols * object.y) + object.x).empty();
    /* move to new table cell and matrix cell */
    this.objects[x][y] = object;
    var element = $('td').eq((this.cols * y) + x);
    element.append(object.element);
};

// Player class

function Object(type) {
    this.x;
    this.y;
    this.coins = 0;
    this.type = type;
    this.rotation = 0;
    this.imgSrc = null;
}

Object.prototype.createHtml = function() {
    /* somewhere else would be better :) */
    if (this.type === "player") {
        this.imgSrc = 'media/ninja.png';
    } else if (this.type === "wall") {
        this.imgSrc = 'media/wall.png';
    } else if (this.type === "coin") {
        this.imgSrc = 'media/coin.png';
    } else if (this.type === "boss") {
        this.imgSrc = 'media/boss.png';
    }
    var element = document.createElement('img');
    element.src = this.imgSrc;
    element.alt = this.type;
    console.log(element);
    this.element = element;
};

Object.prototype.turn = function(dir) {
    /* when player is turning left */
    if (dir === "left") {
        /* anti-clockwise rotation */
        this.rotation -= 90;
        /* when anti-clockwise rotation is completed, go to 270 */
        if (this.rotation < 0) this.rotation = 270;
    } else {
        /* clockwise rotation */
        this.rotation += 90;
        /* when clockwise rotation is completed, go to 0 */
        if (this.rotation > 270) this.rotation = 0;
    }
    /* add the rotation class */
    this.element.className = "rotate"+this.rotation;
};

// This test

$(document).ready(function() {
	var map = new Map();
	map.setup($('#map-container'));
	map.loadMap("lorem.json");
	map.createHtml(map.cols, map.rows);

	var player = new Object("player");
    player.createHtml();
	map.addObject(player, 0, 0);
    player.turn('right');
    map.moveObject(player);

	$(window).resize(function() {
		map.calcSize();
	});
});
