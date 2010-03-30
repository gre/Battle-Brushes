onmessage = function(event) {
  if(event.data[0]='pingInitGame')
    postMessage(['pongInitGame']);
}