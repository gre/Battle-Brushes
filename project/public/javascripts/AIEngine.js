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
  $('#loading').show();
  
  if(!window.utils) window.utils = {};
  if(!window.bb) window.bb = {};
  var utils = window.utils;
  var bb = window.bb;
  
  var debug = utils.debug;
  var Profiler = utils.Profiler;
  
  /** AI Engine **/
  bb.AIEngine = function(player, worker) {
    this.player = player;
    this.worker = worker;
    
    this.cycle = function() {
      var player = this.player;
      var worker = this.worker;
      var infos = { // TO BE IMPROVED
        clock: bb.Infos.getClock(),
        self: {
          x: player.x,
          y: player.y
        }
      };
      worker.postMessage(['cycle', infos ]);
    };
    
    this.init = function() {
      var player = this.player;
      this.worker.onmessage = function(e) {
        if(e.data[0]=='turnTo') {
          var choice = e.data[1];
          player.rot = 0;
          if(choice) {
            if(choice == "left" || choice<0)
              player.rot = -1;
            else if(choice == "right" || choice>0)
              player.rot = 1;
          }
        }
        else if(e.data[0]=='debug') {
          debug(e.data[1]);
        }
      }
    };
  };
  
}());