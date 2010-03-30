var LEFT = -1;
var RIGHT = 1;
var AHEAD = 0;

function turnLeft() {
  postMessage(['turnTo', LEFT]);
  return LEFT;
}
function turnRight() {
  postMessage(['turnTo', RIGHT]);
  return RIGHT;
}
function continueAhead() {
  postMessage(['turnTo', AHEAD]);
  return AHEAD;
}
function turnTo(t) {
  postMessage(['turnTo', t]);
}

function betOneIn(n) {
  return n*Math.random()<1;
}


cycle = function(){};

onmessage = function(event) {
  if(event.data[0] == 'cycle') {
    cycle(event.data[1]);
  }
}


/** utils **/

var debug = function(t) {
  postMessage(['debug', t]);
}
