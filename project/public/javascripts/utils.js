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
  var DEBUG = true;
  
  if(!window.utils) window.utils = {};
  if(!window.bb) window.bb = {};
  var utils = window.utils;
  var bb = window.bb;
  
  // debug : use debug instead of console.log to manage the dev / prod mode without console not found error
  var debug = utils.debug = !DEBUG||typeof(console)=="undefined"||typeof(console.debug)!="function" ? function(){} : 
              function(){ console.debug.apply(console, Array.prototype.slice.call(arguments)); };
  
  // simple profiler for code optimisation
  var Profiler = utils.Profiler = function() {
    
    var begin, step, display;
    
    var timestamp;
    var timestamps = [];
    
    var times = [];
    var counts = [];
    var formatMs = function(ts) {
      return (ts>=1000) ? (Math.floor(ts)/1000)+'s': Math.floor(ts)+'ms';
    };
    if(DEBUG) {
      begin = function(id) {
        if(!id)
          timestamp = new Date().getTime();
        else
          timestamps[id] = new Date().getTime();
      };
      step = function(id) {
        var now = new Date().getTime();
        if(!(id)) {
          debug(formatMs(now-timestamp));
          timestamp = now;
        }
        else {
          if(!times[id]) {
            times[id]=0;
            counts[id]=0;
            if(!timestamps[id])
              timestamps[id]=now;
          }
          times[id]+=(now-timestamps[id]);
          counts[id]++;
          timestamps[id]=now;
        }
      };
      display = function() {
        for(var t in times) {
          var diff = times[t];
          var count = counts[t];
          debug(t+': '+formatMs(diff/count)+' ('+formatMs(diff)+'/'+count+')');
        }
        times=[];
        counts=[];
        timestamps=[];
      };
    }
    else
      begin = step = function(){};
    
    return {
      begin: begin,
      step: step,
      display: display
    }
  }();
  
  var buff_canvasCtx = [];
  /**
   * retrieve a canvas by id and return the 2d context
   * create if not exists with size (width, height) if defined
   */
  var C = utils.canvas = function(id, width, height) {
    if(buff_canvasCtx[id]) return buff_canvasCtx[id];
    var node = $('#'+id);
    if(!node.size()) {
      node = $('<canvas id="'+id+'" >');
      if(width) node.attr('width',width);
      if(height) node.attr('height', height);
      $('#canvasContainer').append(node);
    }
    return buff_canvasCtx[id] = node[0].getContext("2d");
  };
  
  /**
   * To know if a key is pressed or released
   */
  utils.pressedKeys = function(){
    var g_keys = [];
    return {
      init: function() {
        document.addEventListener('keydown', function(e){
          g_keys[e.keyCode]=true;
        }, false);
        document.addEventListener('keyup', function(e){
          g_keys[e.keyCode]=false;
        }, false);
      },
      isPressed: function(keyCode) {
        return !g_keys[keyCode]?false:true;
      }
    }
  }();
  $().ready(utils.pressedKeys.init);
  
  /**
   * Loading image tools
   */
  utils.loadImages = function(callback) {
    var images = [];
    $('#imageLoader img').each(function(i,node){
      images.push($(node).attr('src'));
    });
    
    var loadImage = function(src, callback) {
      var image = new Image();
      image.onload = callback;
      image.src = src;
    };
    
    var count = images.length;
    for(var i in images) {
      loadImage(images[i], function(load) {
        if(count == 0) return;
        --count;
        if(count == 0) callback();
      });
    }
  };
  
  /**
   * restrict a value between two bounds
   */
  utils.restrictValue = function(value, min, max) {
    if(min && value<min) return min;
    if(max && value>max) return max;
    return value;
  };
  
  /**
   * Generate random numbers with seed
   */
  utils.RandomNumberGenerator = function(seed){
    this.seed = seed||new Date().getTime();
    this.A = 48271;
    this.M = 2147483647;
    this.Q = this.M / this.A;
    this.R = this.M % this.A;
    this.oneOverM = 1.0 / this.M;
    this.next = function(){
      var hi = this.seed / this.Q;
      var lo = this.seed % this.Q;
      var test = this.A * lo - this.R * hi;
      if(test > 0){
        this.seed = test;
      } else {
        this.seed = test + this.M;
      }
      return (this.seed * this.oneOverM);
    };
    return this;
  };
  
}());