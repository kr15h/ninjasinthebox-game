/* for blockly */
var map = null;
var player = null;
function move(code) {
    var index = 0;
    var lines = code.split('\n');
    /* execute line by line */
    var interval = setInterval(tick, 500);
    function tick() {
        if (index == lines.length) clearInterval(interval);
        eval(lines[index++]);
    }
}
function moveForward() {
  map.moveObject(player);
}
function turnLeft() {
  player.turn('left');
}
function turnRight() {
  player.turn('right');
}

(function () {
  'use strict';

  function Map(rows, cols) {
    this.rows = rows || 10;
    this.cols = cols || 10;
    this.container = {};
    this.mapData = [];

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

  // Returns map data as javascript array object
  Map.prototype.parseMapData = function(mapData) {

    // Create a multi-dimensional array out of map data csv
    // 1. split rows by using \n as delimiter
    var rows = mapData.split('\n');
    if (rows.length <= 1) {
      rows = mapData.split('\r');
    }
    if (rows.length <= 1) {
      rows = mapData.split('\n\r');
    }
    if (rows.length <= 1) {
      rows = mapData.split('\r\n');
    } 
    if (rows.length <= 1) {
      // Total fail, WTF???
      alert('Error - invalid CSV row delimiter');
      return false;
    }

    // 2. split each row into cols
    var numCols = 0;
    for (var rowIter = 0; rowIter < rows.length; rowIter++) {
      var cols = rows[rowIter].split(',');

      // Set numCols if first row
      if (rowIter === 0) {
        numCols = cols.length;
      }

      if (numCols > 0 && cols.length === numCols) {

        // Remove first and last column
        cols.splice(0, 1);
        cols.splice(-1, 1);

        // Reasign current row to array object
        rows[rowIter] = cols;

      } else {

        //console.log('Row ' + rowIter + ' not valid');
        
        // Remove this row
        rows.splice(rowIter, 1);

      }

    } // for rows

    // Remove first and last rows
    rows.splice(0, 1);
    rows.splice(-1, 1);

    return rows;

  };

  Map.prototype.loadMap = function(fileUrl) {
    
    console.log(fileUrl);

    // Hack to make this accessible from within 
    // ajax success callback function
    var that = this; 

    $.ajax({
      url : "maps/Level_1.csv",
      dataType: "text",
      success: function (data) {
        console.log('Successfully loaded map');
        that.mapData = that.parseMapData(data);
        //console.log(that.mapData);
      },
      error: function(jqxhr, status, error) {
        console.log('Error loading map: ' + status + ', ' + error);
      }
    }); // ajax
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
    if (object.rotation === 0) {
        y += 1;
    } else if (object.rotation === 90) {
        x -= 1;
    } else if (object.rotation === 180) {
        y -= 1;
    } else {
        x += 1;
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
        /* collision is only ok with coins */
        if (obj.type === "coin") {
            /* collect the coin */
            alert("ruble yay!");
            delete this.objects[x][y];
            $('td').eq((this.cols * y) + x).empty();
        } else {
            /* ?..? */
            return;
        }
    }
    /* clear the previouse table cell and object matrix slot */
    delete this.objects[object.x][object.y];
    /* move to new table cell and matrix cell */
    object.x = x;
    object.y = y;
    this.objects[x][y] = object;
    var element = $('td').eq((this.cols * y) + x);
    element.append(object.element);
  };

  // Player class
  function Object(type) {
    this.x = 0;
    this.y = 0;
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
        this.imgSrc = 'media/button.png';
    } else if (this.type === "coin") {
        this.imgSrc = 'media/sprites.png';
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
    map = new Map();
    map.setup($('#map-container'));
    map.loadMap("lorem.json");
    map.createHtml(map.cols, map.rows);

    player = new Object("player");
    player.createHtml();
    map.addObject(player, 0, 0);

    var wall = new Object("wall");
    wall.createHtml();
    map.addObject(wall, 0, 1);

    var wall2 = new Object("wall");
    wall2.createHtml();
    map.addObject(wall2, 2, 2);

    var wall3 = new Object("wall");
    wall3.createHtml();
    map.addObject(wall3, 2, 0);

    var coin = new Object("coin");
    coin.createHtml();
    map.addObject(coin, 1, 1);

    $(window).resize(function() {
      map.calcSize();
    });

    $('#blockly-stuff').on('show.bs.collapse', function () {
      console.log('on show');
      $('.blockly-icon-up').removeClass('hidden');
      $('.blockly-icon-down').addClass('hidden');
    });

    $('#blockly-stuff').on('hide.bs.collapse', function () {
      console.log('on hide');
      $('.blockly-icon-down').removeClass('hidden');
      $('.blockly-icon-up').addClass('hidden');
    });
  }); // document ready
}()); // closure
