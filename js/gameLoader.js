//      battle brushes game
//      
//      Copyright 2010 Gaetan Renaudeau <contact@grenlibre.fr>
//      
//      This program is free software; you can redistribute it and/or modify
//      it under the terms of the GNU General Public License as published by
//      the Free Software Foundation; either version 2 of the License, or
//      (at your option) any later version.
//      
//      This program is distributed in the hope that it will be useful,
//      but WITHOUT ANY WARRANTY; without even the implied warranty of
//      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//      GNU General Public License for more details.
//      
//      You should have received a copy of the GNU General Public License
//      along with this program; if not, write to the Free Software
//      Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
//      MA 02110-1301, USA.

(function(){
  
  if(!window.utils) window.utils = {};
  if(!window.bb) window.bb = {};
  var utils = window.utils;
  var bb = window.bb;
  
  var debug = utils.debug;
  
  /** GameLoader 
   * 
   * support and error message managment
   * 
   **/
  bb.GameLoader = function() {
    
    var gameIsLoaded = false;
    
    var loadImages = function(callback) {
      var colors = ['blank', 'red', 'blue', 'yellow', 'green'];
      for(var c in colors)
        for(var t in colors)
          if(colors[c]!="blank" || colors[c]=="blank"&&colors[t]=="blank")
          $('#imageLoader').append('<img id="player_'+colors[c]+'_'+colors[t]+'" src="gfx/players/'+colors[c]+'.'+colors[t]+'.png" />');
      utils.loadImages(callback);
    };
    
    return {
      isLoaded: function() {
        return gameIsLoaded;
      },
      load: function(success, error) {
        $('#loading').show();
        if(!success) success=function(){};
        if(!error) error=function(){};
        
        debug('test canvas support...');
        // Support
        var canv = $('<canvas />')[0];
        if(!canv.getContext||!canv.getContext('2d')) {
          $('#loading').remove();
          $('#errors').append('<div class="error">Canvas not supported by your browser. Please install a html5 suppliant browser like firefox.</div>');
          debug('canvas not supported');
          return error();
        }
          
        var browser = "";
        if(window.navigator.userAgent.indexOf('Chrome')!=-1)
          browser = 'Please upgrade your Chrome browser';
        else if(window.navigator.userAgent.indexOf('Mozilla')!=-1)
          browser = 'Please upgrade to firefox 3.6+';
        else 
          browser = 'Please upgrade to a HTML5 suppliant browser';
        
        debug('test workers support...');
        if(typeof(Worker)=="undefined") {
          $('#errors').empty().append('<div class="error">Web workers not supported. '+browser+'.</div>');
          $('#loading').remove();
          debug('web workers not supported');
          return error();
        }
        
        debug('loading workers...');
        try {
          var workerTest = new Worker("initWorker.js");
        }
        catch(e) {
          debug('worker load failed');
          debug(e);
          $('#errors').empty().append('<div class="error">Web workers load failed ('+e.name+'). '+browser+'.</div>');
          $('#loading').remove();
          return error();
        }
        gameIsLoaded = false;
        workerTest.onmessage = function(e){
          if(!gameIsLoaded && e.data[0]=="pongInitGame") {
            gameIsLoaded = true;
            debug('loading images...');
            loadImages(function(){
              debug('gameLoader success.');
              success();
            });
          }
        };
        workerTest.postMessage(['pingInitGame']);
        
        debug('waiting worker ping response...');
        setTimeout(function() {
          if(!gameIsLoaded) {
            $('#errors').empty().append('<div class="error">Web workers ping test failed. '+browser+'.</div>');
            $('#loading').remove();
            debug('web workers ping test failed');
            error();
          }
        }, 4000);
      }
    }
  }();
  
}());
