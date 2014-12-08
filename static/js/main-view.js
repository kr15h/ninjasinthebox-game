(function () {
	'use strict';

	function MainView() {
		this.container = null; // jQuery object
		this.ninjaMarginTop = 0;
		this.ninjaMarginLeft = -30;
	}

	MainView.prototype.setup = function(jQueryContainerObject) {
		if (arguments.length) {
			this.container = jQueryContainerObject;
			this.container.hide();

			var ninjaMarginLeftPx = String(this.ninjaMarginLeft) + 'px';
			this.container.find('.ninja>img').css('margin-left', ninjaMarginLeftPx);

			var that = this;
			preloadimages(['media/main-view-ninja.svg'], function(images) {
				that.onWindowResize();
			});

			this.container.find('#main-view-modal').modal({
				keyboard: false,
				backdrop: 'static',
				show: false
			});

			// Hide all main view modal parts except first one
			this.container.find('.mission').hide();
			this.container.find('.team-up').hide();
			this.container.find('.room-master').hide();
			this.container.find('.room-client').hide();

			this.container.find('.story button').click(function(){
				that.container.find('.story').hide();
				that.container.find('.mission').show();
			});

			this.container.find('.mission .btn-back').click(function(){
				that.container.find('.mission').hide();
				that.container.find('.story').show();
			});

			this.container.find('.mission .btn-forward').click(function(){
				//alert();
				if(ROOT.user_id === "undefined"){
					$.ajax({
						url: "http://morriswinkler.koding.io/newUser", 
						data: { userName: prompt("Please insert your username") },
						success: function (data){
							ROOT.user_id = data.Space[0].UserId;
							ROOT.user_name = data.Space[0].UserName;
						}
					});
				}
				else{
				$.get("http://morriswinkler.koding.io/getSpace", function(data){
					//alert(data.Channel);
					that.container.find('.mission').hide();
					that.container.find('.team-up').show();
                            var string = "";
							var games = data.Games;
							for(var i = 0; i < games.length; i++){
								string += "<li class='game' id='" + games[i].GameId + "'>Game " + (i+1) + "</li><ul class='room-user-list'>";
								for(var j = 0; j < games[i].Player.length; j++){
									string += "<li id='" + games[i].Player[j].UserId + "'>" + games[i].Player[j].UserName + "</li>";
								}
								string += '</ul><button id="btn-join-room-'+i+'" class="btn btn-primary btn-sm btn-join-room">Join</button>';
							}
							$("#available-games ul").append(string);
				});
				}
			});

			this.container.find('.team-up .btn-forward').click(function(){
				that.container.find('.team-up').hide();
				that.container.find('.room-master').show();
			});

			// Add room
			this.container.find('.team-up .btn-add-room').click(function(){
				that.container.find('.team-up').hide();
				that.container.find('.room-master').show();
			});

			// Join room
			this.container.find('.team-up .btn-join-room').click(function(){
				that.container.find('.team-up').hide();
				that.container.find('.room-client').show();
			});

			// Leave room-master
			this.container.find('.room-master .btn-leave').click(function(){
				that.container.find('.room-master').hide();
				that.container.find('.team-up').show();
			});

			// Start game in room-master
			this.container.find('.room-master .btn-start-game').click(function(){
                that.container.find('#main-view-modal').modal('hide')
                ROOT.startGame();
			});

			// Leave room-client
			this.container.find('.room-client .btn-leave').click(function(){
				that.container.find('.room-client').hide();
				that.container.find('.team-up').show();
			});

		} else {
			console.log('No container object specified');
		}
	};

	MainView.prototype.show = function() {
		this.container.show();
	};

	MainView.prototype.hide = function() {
		this.container.hide();
	};

	MainView.prototype.calcNinjaTopMargin = function() {
		var ninja = this.container.find('.ninja');
		var ninjaMarginTop = String(ninja.find('img').width() / 1.8) + 'px';
		console.log(ninjaMarginTop);
		ninja.css('margin-top', ninjaMarginTop);
	};

	MainView.prototype.onWindowResize = function() {
		this.calcNinjaTopMargin();
	};

	ROOT.MainView = MainView;

}()); // closure