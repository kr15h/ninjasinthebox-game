(function () {
    'use strict';

    var Blockly = null;
    function GameView() {
        this.map = null;
        this.container = null;
    }

    function Map(rows, cols) {
    this.rows = rows || 10;
    this.cols = cols || 10;
    this.container = {};
    this.mapData = [];

    /* parse map constants */
    this.COIN = '$';
    this.EMPTY = '0';
    this.BOSS = 'B';
    this.WALL = 'x';
    this.TRAP = 'g'; //frank
    //this.Triger = 'T'; toomuch?

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

  Map.prototype.loadMap = function(fileUrl, onSuccess) {
    
    console.log(fileUrl);

    // Hack to make this accessible from within 
    // ajax success callback function
    var that = this; 

    $.ajax({
      url : fileUrl,
      dataType: "text",
      success: function (data) {
        console.log('Successfully loaded map');
        that.mapData = that.parseMapData(data);

        // repopulate map objects storage array
        that.objects.length = 0;
        for(var i = 0; i < that.mapData.length; i++) {
          that.objects[i] = new Array(that.mapData[i].length);
        }

        //console.log(that.mapData);
        onSuccess();
      },
      error: function(jqxhr, status, error) {
        console.log('Error loading map: ' + status + ', ' + error);
      }
    }); // ajax
  };

  Map.prototype.createHtml = function() {
    
    this.cols = this.mapData[0].length;
    this.rows = this.mapData.length;

    var tableHtml = '';
    tableHtml += '<table>';

    var rowsIter;
    var colsIter;
    
    for (rowsIter = 0; rowsIter < this.rows; rowsIter++) {
      tableHtml += '<tr>';
      for (colsIter = 0; colsIter < this.cols; colsIter++) {
        tableHtml += '<td></td>';
      }
      tableHtml += '</tr>';
    }

    tableHtml += '</table>';
    this.container.empty();
    this.container.append(tableHtml);
    this.calcSize();

    for (rowsIter = 0; rowsIter < this.mapData.length; rowsIter++) {
      for (colsIter = 0; colsIter < this.mapData[0].length; colsIter++) {
        
        var mapCell = this.mapData[rowsIter][colsIter];
        //console.log('mapCell val: ' + mapCell + ', colsIter: ' + colsIter + ', rowsIter: ' + rowsIter);

        if (mapCell === this.WALL) {

          var wall = new Object("wall");
          wall.createHtml();
          this.addObject(wall, colsIter, rowsIter);

        } else if (mapCell === this.COIN) {

          var coin = new Object("coin");
          coin.createHtml();
          this.addObject(coin, colsIter, rowsIter);

        } else if (mapCell === this.BOSS) {

          // TODO: Add boss object

        }
      }
    }
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

  Map.prototype.destroy = function() {
    this.container.empty();
  };

  Map.prototype.moveObject = function(object) {
    /* see where the player needs to be moved */
    var x = object.x, y = object.y;
    if (object.rotation === 0 || object.rotation === 360 || object.rotation === -360) {
        y += 1;
    } else if (object.rotation === 90 || object.rotation === -270) {
        x -= 1;
    } else if (object.rotation === 180 || object.rotation === -180) {
        y -= 1;
    } else {
        x += 1;
    }
    /* check for map borders */
    if (x < 0 || y < 0 || x > this.cols - 1 || y > this.rows - 1) {
        /* trying to escape map */
        this.emitEscape();
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
            this.emitCoin();
            delete this.objects[x][y];
            $('td').eq((this.cols * y) + x).empty();
        } else if (obj.type === "wall") {
            this.emitWall();
            //$('#bribe-modal').modal('show');
            return;
        } else {
            this.emitBoss();
            $('#bribe-modal').modal('show');
        }
    }
    /* clear the previouse table cell and object matrix slot */
    delete this.objects[object.x][object.y];
    /* move to new table cell and matrix cell */
    object.x = x;
    object.y = y;
    $.get("http://morriswinkler.koding.io/userMoved?gameId="+ROOT.game_id+"&userId="+ROOT.user_id+"&x="+x+"&y="+y, function(data){
        alert(JSON.stringify(data));
    });
    this.objects[x][y] = object;
    var element = $('td').eq((this.cols * y) + x);
    var classNames = object.element.className;
    object.element.className = classNames + " ninja-hidden";
    setTimeout(function() {
        element.append(object.element);
        setTimeout(function() {
            object.element.className = classNames + " ninja-visible";
        }, 50);
    }, 300);
  };

  // Object class
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
        this.imgSrc = 'media/Wall.png';
    } else if (this.type === "coin") {
        this.imgSrc = 'media/coin.png';
    } else if (this.type === "boss-tl") {
        this.imgSrc = 'media/stagin_tl.png';
    } else if (this.type === "boss-tr") {
        this.imgSrc = 'media/stagin_tr.png';
    } else if (this.type === "boss-bl") {
        this.imgSrc = 'media/stagin_bl.png';
    } else if (this.type === "boss-br") {
        this.imgSrc = 'media/stagin_br.png';
    }
    var element = document.createElement('img');
    element.src = this.imgSrc;
    element.alt = this.type;
    console.log(element);
    this.element = element;
  };

  Object.prototype.turn = function(dir) {
    /* anti-clockwise rotation */
    if (dir === "left") this.rotation -= 90;
    /* clockwise rotation */
    else this.rotation += 90;
    /* add the rotation class */
    this.element.className = "rotate"+this.rotation;
    /* when rotation is completed, go to 0 */
    if (Math.abs(this.rotation) == 360) {
        /* secretly go back to 0 degree */
        this.rotation = 0;
        var el = this.element;
        setTimeout(function() {
            el.className = "rotate0";
        }, 400);
    }
  };

  GameView.prototype.destroy = function() {
    this.map.destroy();
  };

    GameView.prototype.setup = function(container, blockly) {
        
        var player = null;
        var map = new Map();
        this.map = map;
        map.setup($('#map-container'));

        // TODO: show loader

        // Async map loading... Provide anonymous callback func
        map.loadMap('maps/Level_1.csv', function() {
            map.createHtml();

            var boss_tl = new Object("boss-tl");
            boss_tl.createHtml();
            map.addObject(boss_tl, 9, 9);

            var boss_tr = new Object("boss-tr");
            boss_tr.createHtml();
            map.addObject(boss_tr, 10, 9);

            var boss_bl = new Object("boss-bl");
            boss_bl.createHtml();
            map.addObject(boss_bl, 9, 10);

            var boss_br = new Object("boss-br");
            boss_br.createHtml();
            map.addObject(boss_br, 10, 10);

            player = new Object("player");
            player.createHtml();
            map.addObject(player, 0, 0);
        });
        
        /* Blockly stuff */
        map.emitWall = emitWallAhead;
        map.emitBoss = emitBossReached;
        map.emitEscape = emitEscapeMaze;
        map.emitCoin = emitCoinCollected;


        if (Blockly !== null) {
            return;
        }

        Blockly = blockly;
        this.container = container;
        /* Blockly stuff */
        Blockly.Blocks.maze_move = {
            // Block for moving forward/backward
            helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
            init: function() {
                this.setHSV(184, 1.00, 0.74);
                this.appendDummyInput()
                    .appendTitle("move forward"/*new Blockly.FieldDropdown(this.DIRECTIONS)*/, 'DIR');
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setTooltip("move forward");
            }
        };
        Blockly.Blocks.maze_move.DIRECTIONS =
            [['move forward', 'moveForward'],
            ['move backward', 'moveBackward']];
        Blockly.Generator.get('JavaScript').maze_move = function() {
            // Generate JavaScript for moving forward/backward
            //var dir = this.getTitleValue('DIR');
            return /*dir + */'moveForward();\n';
        };
        Blockly.Blocks.maze_turn = {
            // Block for turning left or right.
            helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
            init: function() {
            this.setHSV(184, 1.00, 0.74);
            this.appendDummyInput()
                .appendTitle(new Blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setTooltip("turn left or right");
            }
        };
        Blockly.Blocks.maze_turn.DIRECTIONS =
            [['turn left' + ' \u21BA', 'turnLeft'],
            ['turn right' + ' \u21BB', 'turnRight']];
        Blockly.Generator.get('JavaScript').maze_turn = function() {
            // Generate JavaScript for turning left or right.
            var dir = this.getTitleValue('DIR');
            return dir + '();\n';
        };
        Blockly.inject(document.getElementById('blockly'), {
            path: ".",
            trashcan: true,
            toolbox: '<xml id="toolbox" style="display: none;">' +
                '<block type="maze_move"></block>' +
                '<block type="maze_turn"><title name="DIR">turnLeft</title></block>' +
                '<block type="maze_turn"><title name="DIR">turnRight</title></block></xml>',
        });
        
        Blockly.loadAudio_([Blockly.assetUrl("media/wall.ogg")], "wall");
        Blockly.loadAudio_([Blockly.assetUrl("media/Boss.wav")], "boss");
        Blockly.loadAudio_([Blockly.assetUrl("media/escape.ogg")], "escape");
        Blockly.loadAudio_([Blockly.assetUrl("media/sswooshing.ogg")], "move");
        Blockly.loadAudio_([Blockly.assetUrl("media/coinpickup.ogg")], "coin");
        function move(code) {
            var index = 0;
            var lines = code.split('\n');
            eval(lines[index++]);
            /* execute line by line */
            var interval = setInterval(function() {
                if (index == lines.length) clearInterval(interval);
                eval(lines[index++]);
            }, 500);
        }
        function moveForward() {
            Blockly.playAudio("move");
            map.moveObject(player);
        }
        function turnLeft() {
            Blockly.playAudio("move");
            player.turn('left');
        }
        function turnRight() {
            Blockly.playAudio("move");
            player.turn('right');
        }
        function emitWallAhead() {
            Blockly.playAudio("wall");
        }
        function emitBossReached() {
            Blockly.playAudio("boss");
            $.get("http://morriswinkler.koding.io/startBribe?gameId="+ROOT.game_id, function(data){
                alert(JSON.stringify(data));
            });
        }
        function emitCoinCollected() {
            Blockly.playAudio("coin");
        }
        function emitEscapeMaze() {
            Blockly.playAudio("escape");
        }
        $('#runButton').on('click', function() {
            move(Blockly.Generator.blockSpaceToCode('JavaScript'));
            Blockly.mainBlockSpace.clear();
        });
        $('#show-code-header').on('click', function() {
            alert(Blockly.Generator.blockSpaceToCode('JavaScript'));
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

        // Pay button
        var that = this;
        this.container.find('.btn-pay').click(function(){
            $('#bribe-modal').modal('hide');
            ROOT.winGame();
        });
        //this.container.find('.btn-pay').hide();

        // Back button
        this.container.find('.btn-back').click(function() {
            $('#bribe-modal').modal('hide');
        });

        this.container.find('#bribe-modal').modal({
            keyboard: false,
            backdrop: 'static',
            show: false
        });
    };

    GameView.prototype.show = function() {
        this.container.show();
    };

    GameView.prototype.hide = function() {
        this.container.hide();
    };
    
    GameView.prototype.onWindowResize = function() {
        //this.map.calcSize();
    };

    ROOT.GameView = GameView;

}()); // closure