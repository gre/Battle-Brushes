importScripts('api.js');

var lastTurn = LEFT;

cycle = function(infos) {
  if(infos.clock % 15 == 0)  { // each 15 cycle
    if(betOneIn(5))
      turnTo(lastTurn); // continue turn like before
    else
      lastTurn = (infos.clock % 30>=15) ? turnLeft() : turnRight(); // altern left-right turn
  }
}
