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
  
  /// Game constants and classes
  
  bb.Global = {
    width: 758,
    height: 758,
    playerSize: 48,
    defaultBrush: 16,
    bonusNumber: 9,
    matchDuration: 5000
  };

  /** class Team **/
  bb.Team = function(color, num) {
    this.color = color;
    this.num = num;
  };
  
  /** class Player **/
  bb.Player = function(o) {
  /** fill options **/
  // etat general defini avant le jeu
    this.name = o.name || "";
    this.isHuman = o.isHuman || false; // none; human ou computer
    this.team = o.team || null; // equipe correspondante
    this.color = o.color || "blank"; // couleur actuel de peinture
    this.lkey = o.lkey || null; // numero de la touche left du joueur
    this.rkey = o.rkey || null; // numero de la touche right du joueur  
    
  // etat actuel durant le jeu
    this.x = o.x || 0; // position x du centre du joueur
    this.y = o.y || 0; // position y du centre du joueur
    this.angle = o.angle || 0; // angle d'orientation en radian
    this.rot = o.rot || 0; // -1 ; 0 ; 1 selon la touche enfonse

  // caracteristiques actuelles
    this.brushSize = o.brushSize || bb.Global.defaultBrush;
    this.speed = o.speed || 3;
    this.rotSpeed = o.rotSpeed || .1; // radian
    
    
    /** Meta data **/
    this.image = null;
    
    
    this.updateImage = function() {
      this.image = $('#player_'+this.team.color+'_'+this.color)[0];
    };
    
    // METHODS
    
    this.changeColor = function(color) {
      if(color) {
        this.color = color;
        this.updateImage();
      }
    }
    
    this.move = function() {
      var player = this;
      var padding = bb.Global.defaultBrush;
      player.angle += player.rot * player.rotSpeed;
      player.x = utils.restrictValue(player.x + Math.cos(player.angle) * this.speed, padding, bb.Global.width-padding);
      player.y = utils.restrictValue(player.y + Math.sin(player.angle) * this.speed, padding, bb.Global.height-padding);
    };
    
    this.cycle = function() {
      if(this.isHuman) {
        var left = utils.pressedKeys.isPressed(this.lkey);
        var right = utils.pressedKeys.isPressed(this.rkey);
        if(left && !right)
          this.rot = -1;
        else if(!left && right)
          this.rot = 1;
        else
          this.rot = 0;
      }
      else
        this.aiEngine.cycle();
      this.move();
    };
    
    
    // INIT
    this.init = function() {
      this.color = this.team.color;
      this.updateImage();
      if(o.aiScript || o.aiWorker) {
        var worker = o.aiWorker ? o.aiWorker : new Worker(o.aiScript);
        this.aiEngine = new bb.AIEngine(this, worker);
        this.aiEngine.init();
      }
    };
  };
  
}());