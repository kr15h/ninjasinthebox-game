// Map class

function Map() {
	this.cols = 10;
	this.rows = 10;
	this.container = {};

	this.walls = [];
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


// Player class

function Player() {
	this.container = {};
	this.imgSrc = 'media/ninja.png';
}

Player.prototype.setup = function(jQueryContainerObject) {
	if (arguments.length) {
		this.container = jQueryContainerObject;
	} else {
		console.log('Player.setup(): please specify container object');
	}
};

Player.prototype.createHtml = function() {
	var playerHtml = '<img src="' + this.imgSrc + '" alt="Player">'
	console.log(this.container);
	this.container.empty();
	this.container.append(playerHtml);
}


// This test

$(document).ready(function() {
	
	var map = new Map();
	map.setup($('#map-container'));
	map.loadMap("lorem.json");
	map.createHtml();

	var player = new Player();
	var mapCell = $('td').eq(14);
	player.setup(mapCell);
	player.createHtml();

	$(window).resize(function() {
		map.calcSize();
	});

});

