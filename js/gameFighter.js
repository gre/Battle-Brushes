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
  
  var C = utils.canvas;
  var debug = utils.debug;
  var Profiler = utils.Profiler;
  
  bb.GameFighter = function(){
    
    var newGame = function(level) {
      bb.Game.emptyPlayersTeams();
      var total = 5000;
      var bonusNumber = 9;
      
      if(level==1) {
        bb.Game.addTeams(2);
        bb.Game.addHumanPlayer('human', 0);
        bb.Game.addAiPlayer('stupid', 1);
        total = 2000;
        bonusNumber = 2;
      }
      else if(level==2) {
        bb.Game.addTeams(4);
        bb.Game.addHumanPlayer('human', 0);
        bb.Game.addAiPlayer('stupid', 1);
        bb.Game.addAiPlayer('stupid', 2);
        bb.Game.addAiPlayer('stupid', 3);
      }
      
      bb.GamePanel.panelMessage('Level '+level);
      bb.Global.matchDuration = total;
      bb.Global.bonusNumber = bonusNumber;
      bb.GamePanelAnimator.init();
      bb.Game.startMatch();
    };
    
    return {
      startGame: function(level) {
        $('#coderPanel').hide();
        newGame(level);
      }
    }
  }();
  
}());