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
  
  /** Game GamePanelAnimator
   * duration & time unit is a cycle
   **/
  bb.GamePanelAnimator = function() {
    
    // Modifiable constants :
    var duration_liquid2_waitBeforeEmptying = 30; // pressure led blink
    var duration_valveOpening = 10;
    var duration_liquid2_emptying = 180;
    var interval_liquid2Flow_valveFlow = 2;
    var duration_valveFlow = 10;
    var interval_liquid2Flow_handClockRotation = 6;
    var duration_handClockRotation = 200;
    
    var interval_blink = 4;
    var interval_blink_bonusLed = 10;
    var seedHandClock = 0.5;
    
    var timeOutBeforeEnd = 500; // TODO : use this
    
    // Given at init()
    var duration_total;
    var bonusNumber;
    
    // calculated
    var duration_liquid2_fill;
    var duration_bonusLoad;
    var duration_bonusInterval;
    var times_bonusLoadingStart = [];
    var liquid1_total;
    
    var BEFORE_BONUS = -1;
    var AFTER_BONUS = -2;
    var NOT_CHANGED = null;
    
    var handClockMaxSpeed;
    var handClockStartAngle;
    
    var getCurrentBonusLoadIndice = function(i) {
      if(i<times_bonusLoadingStart[0])
        return BEFORE_BONUS;
      if(i>(times_bonusLoadingStart[times_bonusLoadingStart.length-1]+duration_bonusInterval))
        return AFTER_BONUS;
      for(var indice=0; indice<times_bonusLoadingStart.length; ++indice) {
        var val = times_bonusLoadingStart[indice];
        if(i>=val&&i<val+duration_bonusInterval)
          return indice;
      }
    };
    
    /**
     * i : current i
     * relative time, begin at a bonusLoadingStart time
     */
    var getRelativeBonusLoadChanges = function(i, bonusLoadIndice) {
      var changes = {};
      if(bonusLoadIndice<0)
        return changes;
      i -= times_bonusLoadingStart[bonusLoadIndice]; // i set to relative time for this bonus
      
      if(i>duration_bonusLoad) {
        // nothing
      } 
      else {
        if(i==duration_bonusLoad) {
          // end bonus load
          changes.remaining = bonusNumber-bonusLoadIndice-1;
        }
        
        if(i<=duration_liquid2_fill) {
          // liquid 2 flow
          var ratio = i/duration_liquid2_fill;
          changes.liquid2Fill = ratio;
          changes.pressure = Math.floor(5*ratio);
          changes.liquid1 = (bonusLoadIndice+ratio)/bonusNumber;
        }
        else {
          i -= duration_liquid2_fill; // i set to relative time after end filling
          
          var moduloBlinkRemaining = i%(2*interval_blink_bonusLed);
          if(moduloBlinkRemaining==0) {
            changes.remaining = bonusNumber-bonusLoadIndice;
          }
          else if(moduloBlinkRemaining==interval_blink_bonusLed) {
            changes.remaining = bonusNumber-bonusLoadIndice-1;
          }
          
          if(i<duration_liquid2_waitBeforeEmptying) {
            // blink pressure
            changes.pressure = i%(2*interval_blink)<interval_blink ? 5 : 0;
          }
          if(i==duration_liquid2_waitBeforeEmptying) {
            changes.pressure = 0; // end blink
          }
          else {
            var t = i-duration_liquid2_waitBeforeEmptying; // relative time after time wait before emptying
            var beginFlow = interval_liquid2Flow_valveFlow;
            var endFlow = beginFlow+duration_valveFlow;
            if(t>=beginFlow && t<=endFlow) {
              // begin valve flow
              var ratio = (t-beginFlow)/duration_valveFlow;
              changes.valveFlow = ratio;
            }
            
            var beginRotation = interval_liquid2Flow_handClockRotation;
            var endRotation = beginRotation+duration_handClockRotation;
            if(t>=beginRotation && t<=endRotation) {
              changes.handClock = getRotationAngle(t-beginRotation, bonusLoadIndice);
            }
            
            if(t<=duration_liquid2_emptying) {
              // Empty liquid 2
              var ratio = t/duration_liquid2_emptying;
              changes.liquid2Empty = ratio;
            }
            else {
              t -= duration_liquid2_emptying; // relative time after emptying
              if(t<=duration_valveFlow) {
                // finish valve flow
                var ratio = t/duration_valveFlow;
                changes.valveEndFlow = ratio;
              }
              if(t<=duration_valveOpening) {
                // Closing valve
                var ratio = t/duration_valveOpening;
                changes.valve = ratio;
              }
            }
          }
          
          var d = Math.floor(duration_valveOpening/2);
          if(i>=duration_liquid2_waitBeforeEmptying-d && i<duration_liquid2_waitBeforeEmptying+d) {
            var t = i - (duration_liquid2_waitBeforeEmptying-d);
            var ratio = t/duration_valveOpening;
            changes.valve = 1-ratio;
          }
        }
      }
      return changes;
    };
    
    var getRotationAngle = function(i, bonusLoadIndice) {
      var angle = bonusLoadIndice==0 ? 0 : handClockStartAngle[bonusLoadIndice-1];
      angle += calcAngle(i, duration_handClockRotation, handClockMaxSpeed[bonusLoadIndice]);
      return angle;
    };
    
    var calcAngle = function(x, a, b) {
      return x*x*(b/a)*(0.5-x/(3*a)); // Primitive of (-b/a²)x² + (b/a)x (trajectory parabol)
    };
    
    /**
     * get panel status by game iterator
     */
    var getChanges = function(i) {
      var changes = {};
      var indice = getCurrentBonusLoadIndice(i);
      if(indice<0)
        return changes;
      var relativeChanges = getRelativeBonusLoadChanges(i,indice);
      for(var r in relativeChanges)
        changes[r] = relativeChanges[r];
      return changes;
    };
    
    return {
      init: function() {
        bonusNumber = bb.Global.bonusNumber;
        duration_total = bb.Global.matchDuration;
        
        duration_bonusInterval = duration_total/bonusNumber;
        for(var i=0; i<bonusNumber; ++i)
          times_bonusLoadingStart.push(Math.floor(duration_bonusInterval*i));
        liquid1_total = duration_bonusLoad*bonusNumber;
        
        duration_bonusLoad = duration_liquid2_waitBeforeEmptying+
                             interval_liquid2Flow_handClockRotation+
                             duration_handClockRotation;
        duration_liquid2_fill = duration_bonusInterval - duration_bonusLoad
        duration_bonusLoad += duration_liquid2_fill;
        
        bb.GamePanel.clockHand(0);
        bb.GamePanel.setEventRemainingNumber(bonusNumber);
        bb.GamePanel.setPressureLevel(0);
        bb.GamePanel.setValve(1);
        bb.GamePanel.setLiquidOneLevel(bonusNumber?0:1);
        bb.GamePanel.setLiquidTwoLevel(0);
        bb.GamePanel.setValveFlow(0, true);
        return this;
      },
      
      cycle: function(i) {
        var changes = getChanges(i);
        bb.GamePanel.applyChanges(changes);
      },
      setHandClockSeed : function(seed) {
        seedHandClock = seed;
        var rand = utils.RandomNumberGenerator(seed);
        handClockMaxSpeed = [];
        handClockStartAngle = [];
        var angle = 0;
        var minAngle = 0.5*Math.PI;
        var maxAngle = 1*Math.PI;
        for(var i=0; i<bonusNumber; ++i) {
          var speed = handClockMaxSpeed[i] = (maxAngle-minAngle)*rand.next()+minAngle;
          var y = 0;
          y+=calcAngle(duration_handClockRotation-1,duration_handClockRotation,speed);
          angle += y;
          angle = angle%(2*Math.PI);
          handClockStartAngle[i] = angle;
        }
      },
      getTotal: function() {
        return duration_total;
      }
    }
  }();
  

  bb.GamePanel = function() {
    var g_clock_hand;
    
    var clockHand = function(angle) {
      var c = C('clockHand');
      var w = c.canvas.width;
      var h = c.canvas.height;
      c.clearRect(0, 0, w, h);
      c.save();
      c.translate(w/2, h/2);
      c.rotate(angle);
      c.drawImage(g_clock_hand, -w/2, -h/2);
      c.restore();
    };
    
    var g_del;
    
    var setPressureLevel = function(level) {
      if(level>5)
        level=5;
      var c = C('pressureLED');
      var w = c.canvas.width;
      var h = c.canvas.height;
      c.clearRect(0, 0, w, h);
      if(level<=0)
        return;
      for(var i=0; i<level; ++i)
        c.drawImage(g_del, 16*i, 0);
    };
    
    var setEventRemainingNumber = function(n) {
      if(n>9)
        level=9;
      var c = C('eventLED');
      var w = c.canvas.width;
      var h = c.canvas.height;
      c.clearRect(0, 0, w, h);
      if(n<=0)
        return;
      for(var i=9-n; i<9; ++i)
        c.drawImage(g_del, 22.25*i, 0);
    };
    
    var valve_bar;
    var valve_fg;
    var setValve = function(ratio, ratioFlow) {
      var c = C('valve');
      var percent = !ratio ? 0 : (ratio>1 ? 1 : ratio);
      var x = 50*percent;
      var w = c.canvas.width;
      var h = c.canvas.height;
      c.clearRect(0, 0, w, h);
      c.drawImage(valve_bar, x, 12);
      c.drawImage(valve_fg, 53, 0);
    };
    
    var valve_fg_liquid_under;
    setValveFlow = function(ratio, isStart) {
      var c = C('valveFlow');
      var percent = !ratio ? 0 : (ratio>1 ? 1 : ratio);
      var w = c.canvas.width;
      var h = c.canvas.height;
      c.clearRect(0, 0, w, h);
      c.drawImage(valve_fg_liquid_under, 0, 0);
      if(isStart) {
        var y = (1-percent)*h;
        c.clearRect(0, h-y, w, y);
      }
      else
        c.clearRect(0, 0, w, h*percent);
    };
    
    var liquid1;
    var setLiquidOneLevel = function(ratio) {
      var c = C('Cliquid1');
      var percent = !ratio ? 0 : (ratio>1 ? 1 : ratio);
      var w = c.canvas.width;
      var h = c.canvas.height;
      c.clearRect(0, 0, w, h);
      c.drawImage(liquid1, 0, 0);
      var y = h*percent;
      if(y>340)
        y=340;
      c.clearRect(0, 0, w, y);
    };
    
    var liquid2;
    var setLiquidTwoLevel = function(ratio, emptying) {
      var c = C('Cliquid2');
      var percent = !ratio ? 0 : (ratio>1 ? 1 : ratio);
      var w = c.canvas.width;
      var h = c.canvas.height;
      c.clearRect(0, 0, w, h);
      c.drawImage(liquid2, 0, 0);
      if(!emptying)
        c.clearRect(0, 0, w, h*(1-percent));
      else
        c.clearRect(0, 0, w, h*percent);
    };
    
    var panelMessage = function(text) {
      var node = $('#panelMessage');
      if(typeof(text)=="undefined")
        return node;
      return node.text(text);
    };
    
    var updateScores = function(score) {
      var best = 0;
      var teams = bb.Game.getTeams();
      for(var t in teams)
        if(score.score[t]>best)
          best = score.score[t];
      for(var t in teams) {
        var color = teams[t].color;
        var number = Math.floor(100*score.score[t]/score.total);
        if(!number)
          number='&nbsp;0';
        else {
          if(number<10)
            number = '&nbsp;'+number;
        }
        $('#score .score.'+color).html(number+'&nbsp;%');
        if(best==score.score[t])
          $('#score .score.'+color).addClass('best');
        else
          $('#score .score.'+color).removeClass('best');
      }
    };
    
    var applyChanges = function(changes) {
      for(var c in changes) {
        var val = changes[c];
        if(c=='liquid1')
          setLiquidOneLevel(val);
        else if(c=='liquid2Fill')
          setLiquidTwoLevel(val, false);
        else if(c=='liquid2Empty')
          setLiquidTwoLevel(val, true);
        else if(c=='pressure')
          setPressureLevel(val);
        else if(c=='valve')
          setValve(val);
        else if(c=='valveFlow')
          setValveFlow(val, true);
        else if(c=='valveEndFlow')
          setValveFlow(val, false);
        else if(c=='handClock')
          clockHand(val);
        else if(c=='remaining')
          setEventRemainingNumber(val);
      }
    };
    
    var clean = function() {
        clockHand(0);
        setEventRemainingNumber(9);
        setPressureLevel(0);
        setValve(1);
        setLiquidOneLevel(0);
        setLiquidTwoLevel(0);
        setValveFlow(0, true);
        panelMessage('Battle Brushes');
    };
    
    return {
      init: function() {
        g_del = $('#del_on')[0];
        g_clock_hand = $('#clock_hand')[0];
        valve_bar = $('#valve_bar')[0];
        valve_fg = $('#valve_fg')[0];
        valve_fg_liquid_under = $('#valve_fg_liquid_under')[0];
        liquid1 = $('#liquid1')[0];
        liquid2 = $('#liquid2')[0];
        
        var ul = $('<ul />');
        var colors = ['blue','red','yellow','green'];
        for(var c in colors)
          ul.append('<li class="colortext '+colors[c]+'"><img src="gfx/teams/'+colors[c]+'.png" /> <span class="score '+colors[c]+'"></span></li>');
        $('#score').append(ul);
        clean();
      },
      clean: clean,
      panelMessage: panelMessage,
      updateScores: updateScores,
      applyChanges: applyChanges,
      clockHand: clockHand,
      setEventRemainingNumber: setEventRemainingNumber,
      setPressureLevel: setPressureLevel,
      setValve: setValve,
      setLiquidOneLevel: setLiquidOneLevel,
      setLiquidTwoLevel: setLiquidTwoLevel,
      setValveFlow: setValveFlow
    }
  }();
  $(document).ready(bb.GamePanel.init);

}());