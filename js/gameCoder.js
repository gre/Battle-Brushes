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
  
  bb.GameCoder = function(){
    
      var worker = null;
      var area = null;
    
      var newGame = function(level) {
      bb.Game.emptyPlayersTeams();
      var total = 5000;
      var bonusNumber = 9;
      
      
      if(level==1) {
        bb.Game.addTeams(2);
        bb.Game.addAiCoder('human', 0, worker);
        bb.Game.addAiPlayer('stupid', 1);
        total = 2000;
        bonusNumber = 2;
      }
      else if(level==2) {
        bb.Game.addTeams(4);
        bb.Game.addAiCoder('human', 0, worker);
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
    
    var updateWorker = function(code, callback) {
      if(!worker) worker = new Worker('ai/evaluator.js');
      worker.onmessage = function(e) {
        if(e.data[0]=='error') {
          bb.EditArea.showError(e.data[1]);
        }
        else if(e.data[0]=='success') {
          debug('your code is successful loaded.');
          callback();
        }
        else if(e.data[0]=='debug') {
          debug(e.data[1]);
        }
      };
      worker.postMessage(['evaluate', code]);
    };
    
    var runCode = function(level) {
      updateWorker(bb.EditArea.getValue(), function() {
        $('#coderPanel').fadeOut(500, function(){ newGame(level); });
      });
    };
    
    var stopCode = function() {
      bb.Game.stopMatch();
      $('#coderPanel').fadeIn(500, function(){  });
    };
    
    var updateButtonName = function() {
      var button = $('#coderButtonRunToggle');
      if(!button.hasClass('run'))
        button.text("Stop");
      else
        button.text("Run the code");
    };
    
    return {
      startGame: function(level) {
        // hide gameFighter mode, show gameCoder mode
        bb.EditArea.load();
        bb.EditArea.show();
        var button = $('#coderButtonRunToggle');
        updateButtonName();
        button.show().click(function(){ 
          if(button.hasClass('run')) {
            button.removeClass('run');
            runCode(level);
            updateButtonName();
          }
          else {
            button.addClass('run');
            stopCode();
            updateButtonName();
          }
        });
      }
    }
  }();
  
  
  bb.EditArea = function() {
    var areaId = 'aiCode';
    
    var isLoad = false;
    
    return {
      load: function() {
        if(isLoad) return;
        isLoad = true;
        $('#coderPanel').css('visibility', 'hidden').show();
        editAreaLoader.init({
          id: areaId,
          toolbar: "undo, redo, |, reset_highlight",
          start_highlight: true,
          allow_resize: "no",
          allow_toggle: true,
          word_wrap: true,
          language: "en",
          syntax: "js",
          replace_tab_by_spaces: 2
        });
        setTimeout(function() {
          $('#coderPanel').css('visibility', 'visible')
        }, 500);
      },
      
      init: function() {
        $('#coderPanel .compileError').hide();
      },
      getValue: function() {
        return editAreaLoader.getValue(areaId);
      },
      show: function() {
        $('#coderPanel').show();
      },
      hide: function() {
        $('#coderPanel').hide();
      },
      showError: function(e) {
        var message = (e.type=="global") ? "Unable to eval your code:" : "Error when trying to run your code: ";
        $('#coderPanel .compileError').empty().text(message).append($('<div style="font-weight: bold;">').text(e.message)).show();
      }
    }
  }();
  $(document).ready(bb.EditArea.init);
  
}());
