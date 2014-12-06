// Map class

function Map(rows, cols) {
    this.rows = rows || 10;
	this.cols = cols ||  10;
	this.container = {};

	this.objects = [];
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
    this.objects.push(object);
    if (object.type === "player") this.players.push(object);
    var element = $('td').eq((this.cols * y) + x);
    element.append(object.element);
};

Map.prototype.moveObject = function(object) {
    /* check for collision with items */
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
    $('td').eq((this.cols * object.y) + object.x).empty();
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
	map.createHtml(map.cols, map.rows);

	var player = new Object("player");
    player.createHtml();
	map.addObject(player, 0, 0);
    player.turn('right');
    map.moveObject(player);

	$(window).resize(function() {
		map.calcSize();
	});

	$('#blockly-stuff').on('show.bs.collapse', function () {
		$('.blockly-icon-up').removeClass('hidden');
		$('.blockly-icon-down').addClass('hidden');
	});

	$('#blockly-stuff').on('hide.bs.collapse', function () {
		$('.blockly-icon-down').removeClass('hidden');
		$('.blockly-icon-up').addClass('hidden');
	});

});
