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
  
  // global control of parties
  
  bb.main = function() {
    
    var level = 1;
    
    return {
      init: function() {
        bb.PopupManager.setMode('welcome').show();
        $('.startGame').hide();
        $(document).bind('gameIsReady', function(){
          $('#loading').remove();
          $('.startGame').show();
        });
        $('.startGame.fighter').click(function(){
          bb.PopupManager.hide();
          bb.PopupManager.setMode('level'+level).show();
          $('.startLevel').one('click', function() {
            bb.PopupManager.hide();
            bb.GameFighter.startGame(level);
          });
        });
        $('.startGame.coder').click(function(){
          bb.PopupManager.hide();
          bb.GameCoder.startGame(level);
        });
        
        $(document).bind('gameEnd', function(){
          bb.PopupManager.setMode('end').show(500);
        });
      }
    }
  }();
  
  $(document).ready(bb.main.init);
  
}())