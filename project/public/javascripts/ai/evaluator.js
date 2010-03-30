importScripts('api.js');

onmessage = function(event) {
  if(event.data[0] == 'cycle') {
    cycle(event.data[1]);
  }
  else if(event.data[0] == 'evaluate') {
    try {
      var f = eval('(function(infos){\n'+event.data[1]+'\n})');
      cycle = f;
      // TODO : basically test the function
      try { 
          f({ clock: 0, self: { x: 0, y: 0 } });
          postMessage(['success']);
      }
      catch(e) {
        postMessage(['error', {type:'specific', message:e.message}]);
      }
    }
    catch(e) {
      postMessage(['error', {type:'global', message:e.message}]);
    }
  }
}
