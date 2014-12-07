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

     	this.container.find('.story button').click(function(){
     		that.container.find('.story').hide();
     		that.container.find('.mission').show();
     	});

     	this.container.find('.mission .btn-back').click(function(){
     		that.container.find('.mission').hide();
     		that.container.find('.story').show();
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