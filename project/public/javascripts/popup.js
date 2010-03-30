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
  
  bb.PopupManager = function() {
    
    var modes;
    
    var g_mode = null;
    
    return {
      init: function(){
        modes=['welcome', 'end', 'pause'];
      },
      show: function(t) {
        if(!t)
          $('#popupContainer, #popupBackground').show();
        else
          $('#popupContainer, #popupBackground').fadeIn(t);
        var margintop = (768-$('#popup').height())/2;
        $('#popup').css('margin-top', Math.floor(margintop)+'px');
        return this;
      },
      hide: function(t) {
        if(!t)
          $('#popupContainer, #popupBackground').hide();
        else
          $('#popupContainer, #popupBackground').fadeOut(t);
        return this;
      },
      getMode: function() {
        return g_mode;
      },
      setMode: function(m) {
        g_mode = m;
        var isLevel = !m.match(/^level[0-9]+$/) ? false : true;
        if(isLevel)
          $('#levelContainer').show();
        else
          $('#levelContainer').hide();
        for(var i in modes) {
          var mode = modes[i];
          if(mode==m)
            $('#popup .mode.'+mode).show();
          else
            $('#popup .mode.'+mode).hide();
        }
        return this;
      }
    }
  }();
  $().ready(bb.PopupManager.init);
  
}())