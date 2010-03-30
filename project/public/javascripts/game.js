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
  
  /** Game **/
  bb.Game = function() {
    
    var players = [];
    var teams = [];
    
    var playerCanvasMargin = 0;
    
    var g_pause = false;
    
    var gameIsReady = false;
    var gameCycleRunning = false;
    var gameCycleInterval = null;
    
    
    // utils
    var getPlayerX = function(num) {
      if(num==1||num==3) return bb.Global.width/2;
      if(num==0) return bb.Global.width/2+bb.Global.playerSize;
      if(num==2) return bb.Global.width/2-bb.Global.playerSize;
    };
    var getPlayerY = function(num) {
      if(num==0||num==2) return bb.Global.height/2;
      if(num==1) return bb.Global.height/2+bb.Global.playerSize;
      if(num==3) return bb.Global.height/2-bb.Global.playerSize;
    };
    var getPlayerAngle = function(num) {
      return num*Math.PI/2;
    };
    
    // Draws
    
    var drawPlayers = function() {
      var c = C('players');
      c.clearRect(-playerCanvasMargin,-playerCanvasMargin,C('players').canvas.width,C('players').canvas.height);
      for(var p in players) {
        var player = players[p];
        var playerSize = bb.Global.playerSize;
        c.save();
        c.translate(player.x, player.y);
        c.rotate(player.angle);
        c.drawImage(player.image, -playerSize/2, -playerSize/2, playerSize, playerSize);
        c.restore();
      }
    };
    
    var drawPaints = function() {
      var c = C('paint');
      for(var p in players) {
        var player = players[p];
        c.fillStyle = bb.Palette.getStyle(player.color || teams[player.team]);
        c.beginPath();
        c.arc(player.x, player.y, player.brushSize, 0, 2*Math.PI, true);
        c.fill();
      }
    };
    
    var setPause = function(pause) {
      g_pause = pause;
      if(pause)
        bb.PopupManager.setMode('pause').show();
      else
        if(bb.PopupManager.getMode()=='pause')
          bb.PopupManager.hide();
    };
    
    
    // Not really his place ... Move it
    var end = function() {
      C('players').clearRect(0,0,C('players').canvas.width, C('players').canvas.height);
      bb.GamePanel.panelMessage('Game End');
      $(document).trigger('gameEnd');
    };
    
    var addTeams = function(number) {
      if(number<1) return;
      teams.push(new bb.Team('red',0));
      if(number<2) return;
      teams.push(new bb.Team('blue',1));
      if(number<3) return;
      teams.push(new bb.Team('yellow',2));
      if(number<4) return;
      teams.push(new bb.Team('green',3));
    };
    
    var addAiCoder = function(name, teamNum, aiWorker) {
      var num = players.length;
      players.push( new bb.Player({
        name: name,
        team: teams[teamNum],
        x: getPlayerX(num),
        y: getPlayerY(num),
        angle: getPlayerAngle(num),
        aiWorker: aiWorker
      }) );
    };
    
    var addHumanPlayer = function(name, teamNum) {
      var num = players.length;
      players.push(new bb.Player({
        name: name,
        isHuman: true,
        team: teams[teamNum],
        x: getPlayerX(num),
        y: getPlayerY(num),
        angle: getPlayerAngle(num),
        lkey: 37,
        rkey: 39
      }));
    };
    
    var addAiPlayer = function(scriptName, teamNum) {
      var num = players.length;
      players.push( new bb.Player({
        name: scriptName,
        team: teams[teamNum],
        x: getPlayerX(num),
        y: getPlayerY(num),
        angle: getPlayerAngle(num),
        aiScript: "/public/javascripts/ai/ai."+scriptName+".js"
      }) );
    };
    
    var startCycles = function() {
      gameCycleRunning = true;
      var interval = null;
      var i = 0;
      var total = bb.Global.matchDuration;
      var fadeOutPlayers = 100;
      $('#players').css('opacity', 1);
      
      var cycleIntervalMs = 30;
      var cycleRealIntervalsMs = 0;
      var cycleRealIntervalsCount = 0;
      
      var cycle = function() {
        // checks
        if(g_pause) return;
        if(i>total) {
          stopMatch();
          end();
          return;
        }
        var beginTime = new Date().getTime();
        
        if(i>total-fadeOutPlayers) {
          var ratio = (total-i)/fadeOutPlayers;
          $('#players').css('opacity', ratio);
        }
        
        //graphics
        bb.GamePanelAnimator.cycle(i);
        drawPaints();
        
        if(cycleRealIntervalsCount<10 
        || i % 8 == 0 /* force display each X cycles */ 
        || (cycleRealIntervalsMs/cycleRealIntervalsCount)<cycleIntervalMs) {
            drawPlayers();
        }
        
        // algorithm
        bb.Infos.cycle();
        for(var p in players)
          players[p].cycle();
        if(i%30==0)
          bb.GamePanel.updateScores(bb.Infos.getBufferedCurrentTeamsScore(6));
        ++i;
        
        cycleRealIntervalsMs+=(new Date().getTime()-beginTime);
        cycleRealIntervalsCount++;
      };
      gameCycleInterval = interval = setInterval(cycle, cycleIntervalMs);
    };
    
    var newMatch = function(seed) {
      for(var p in players)
        players[p].init();
      bb.Infos.init();
      bb.GamePanelAnimator.setHandClockSeed(seed);
      startCycles();
    };
    
    var stopMatch = function() {
      if(gameCycleRunning) {
        clearInterval(gameCycleInterval);
        gameCycleInterval = null;
        gameCycleRunning = false;
        bb.GamePanel.clean();
        $('#canvasContainer canvas').each(function() {
          var ctx = C($(this).attr('id'));
          ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
        });
      }
    };
    
    return {
      init: function() {
        bb.GameLoader.load(function() {
          $('#game').show();
          $('#errors').empty().hide();
          $('#canvasContainer').hide();
          C('background', bb.Global.width, bb.Global.height);
          C('paint', bb.Global.width, bb.Global.height);
          C('objects', bb.Global.width, bb.Global.height);
          
          playerCanvasMargin = Math.floor(bb.Global.playerSize/2-bb.Global.defaultBrush);
          C('players', bb.Global.width+2*playerCanvasMargin, bb.Global.height+2*playerCanvasMargin);
          C('players').translate(playerCanvasMargin, playerCanvasMargin);
          $(C('players').canvas).css({ left: (-playerCanvasMargin)+'px', top: (-playerCanvasMargin)+'px'});
          
          $('#canvasContainer').width(bb.Global.width).height(bb.Global.height).show();
          
          $(window).keypress(function(e){
            if(!gameCycleRunning) return;
            if(e.keyCode==13)
              setPause(!g_pause);
            else if(e.keyCode==27)
              setPause(true);
          });
          
          $(document).click(function(e){
            if(!gameCycleRunning) return;
            if($(e.target).is('.pauseToggle'))
              setPause(!g_pause);
            else
              if(!$(e.target).parents().is('#game') && !$(e.target).parents().is('#popup'))
                setPause(true);
          });
          
          $(window).blur(function(){
            if(!gameCycleRunning) return;
            setPause(true);
          });
          
          $(document).trigger('gameIsReady');
        });
      },
      getPlayers: function() {
        return players;
      },
      getTeams: function() {
        return teams;
      },
      startMatch: function() {
        if(gameCycleRunning) stopMatch();
        var seed = Math.floor(1000000*Math.random());
        newMatch(seed);
      },
      stopMatch: stopMatch,
      emptyPlayersTeams: function() {
        players = [];
        teams = [];
      },
      addTeams: addTeams,
      addHumanPlayer: addHumanPlayer,
      addAiPlayer: addAiPlayer,
      addAiCoder: addAiCoder
    }
  }();
  $(document).ready(bb.Game.init);

  /// Game tools
  

  /** Game color palette **/
  bb.Palette = function() {
    var buff_style;
    var buff_rgb;
    
    var addColor = function(name, rgb) {
      buff_rgb[name] = rgb;
      buff_style[name] = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
    };
    
    return {
      init: function() {
        buff_style=[];
        buff_rgb=[];
        addColor('red',   {r:0xC0, g:0x38, b:0x32}); // #C03832
        addColor('blue',  {r:0x47, g:0x8F, b:0xB1}); // #478FB1
        addColor('yellow',{r:0xC1, g:0xA7, b:0x32}); // #C1A732
        addColor('green', {r:0x7C, g:0xB8, b:0x32}); // #7CB832
      },
      getStyle : function(colorName) {
        return buff_style[colorName];
      },
      getRGB: function(colorName) {
        return buff_rgb[colorName];
      }
    }
  }();
  $().ready(bb.Palette.init);
  
  
  
  /** Infos tools
   * TODO : rename / refactor that !!!
   *  **/
  bb.Infos = function() {
    
    var g_clock;
    
    var g_grid_precision;
    var g_grid;
    var g_grid_width;
    var g_grid_height;
    
    var EMPTY = -1;
    
    var getRealCurrentTeamsScore = function(precision) {
      
      var colors = [];
      var score = [];
      if(!precision || precision<1)
        precision = 1;
      var img = C('paint').getImageData(0, 0, bb.Global.width, bb.Global.height);
      var width = img.width;
      var height = img.height;
      var imgData = img.data;
      var teams = bb.Game.getTeams();
      for(var t in teams) {
        colors[t] = bb.Palette.getRGB(teams[t].color);
        score[t] = 0;
      }
      
      var total = 0;
      for(var y=0; y<height; y+=precision)
        for(var x=0; x<width; x+=precision) {
          ++total;
          var d = (y*width + x)*4;
          var a = imgData[d+3];
          if(a) {
            var r = imgData[d];
            var g = imgData[d+1];
            var b = imgData[d+2];
            var found = false;
            for(var c=0; !found && c<colors.length; ++c) {
              var color = colors[c];
              if(color.r==r && color.g==g && color.b==b) {
                score[c] ++;
                found = true;
              }
            }
          }
        }
      return {score:score, total: total};
    };
    
    
    var infGrid = function(a) {
      return a-a%g_grid_precision;
    };
    var supGrid = function(a) {
      return a+g_grid_precision-a%g_grid_precision;
    };
    
    var getBufferedCurrentTeamsScore = function(precision) {
      var colors = [];
      var score = [];
      var teams = bb.Game.getTeams();
      for(var t in teams)
        score[teams[t].num]=0;
      var total = 0;
      for(var y=0; y<g_grid_height; y+=precision)
        for(var x=0; x<g_grid_width; x+=precision) {
          ++total;
          var value = g_grid[y*g_grid_width+x];
          if(value!=EMPTY) {
            ++score[value];
          }
        }
      return {score:score, total: total};
    };
    
    var gridCycleCompute = function() {
      var players = bb.Game.getPlayers();
      for(var p in players) {
        var player = players[p];
        var px = Math.floor(player.x);
        var py = Math.floor(player.y);
        var team = player.team.num;
        var brush = player.brushSize;
        var brush2 = brush*brush;
        var maxX = infGrid(bb.Global.width);
        var maxY = infGrid(bb.Global.height);
        var startX = utils.restrictValue(infGrid(px-brush), 0, maxX);
        var endX = utils.restrictValue(supGrid(px+brush), 0, maxX);
        var startY = utils.restrictValue(infGrid(py-brush), 0, maxY);
        var endY = utils.restrictValue(supGrid(py+brush), 0, maxY);
        
        for(var y=startY; y<endY; y+=g_grid_precision)
          for(var x=startX; x<endX; x+=g_grid_precision) {
            var dx = px-x;
            var dy = py-y;
            var gx = Math.floor(x/g_grid_precision);
            var gy = Math.floor(y/g_grid_precision);
            if(dx*dx+dy*dy<brush2)
              g_grid[gy*g_grid_width+gx] = team;
        
          }
      }
    };
    
    return {
      getBufferedCurrentTeamsScore: getBufferedCurrentTeamsScore,
      getRealCurrentTeamsScore: getRealCurrentTeamsScore,
      
      init: function(){
        g_clock = 0;
        g_grid_precision = 12;
        g_grid = [];
        var w = bb.Global.width;
        var h = bb.Global.height;
        g_grid_width = Math.floor(w/g_grid_precision);
        g_grid_height = Math.floor(h/g_grid_precision);
        for(var y=0; y<g_grid_height; y++)
          for(var x=0; x<g_grid_width; x++)
            g_grid[y*g_grid_width+x] = EMPTY;
      },
      
      cycle: function() {
        g_clock ++;
        gridCycleCompute();
      },
      
      setClock: function(clock) {
       g_clock = clock;
      },
      
      getClock: function() {
       return g_clock; 
      }
    }
  }();
  
  
  
  // TODO //
  
  /** Match Recorder **/
  bb.MatchRecorder = function() {
    return {
      
    }
  }();
  
  /** Match Reader **/
  bb.MatchReader = function() {
    return {
      
    }
  }();
  

}());
