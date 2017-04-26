const five = require('johnny-five');
const path = require('path');
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const pixel = require("./pixel.js");
const port = 3000;
const hostUrl = 'http://192.168.1.142:3000';

const colors = ["red", "green", "blue"];

const STATES = {
  waiting: 'waiting',
  setup: 'setup',
  ready: 'in-progress',
  done: 'done'
}

let board, stripHandler;
let socket = require('socket.io-client')(hostUrl);

  socket.on('connect', function() {
    console.log("Socket connected!", socket.id);    
    registerBoard(socket.id);

    socket.on('board-update-strip', data => {
      data.locations.forEach(location => {
        if (location.locked) return;

        updateStrip(location, data.color)
      })
      setTimeout(() => stripHandler.strip.show(), 100);
    })
  
    socket.on('board-blink-strip', data => {
      let count = 0;
      
      if(!stripHandler.strip) return;      

      let blinkInterval = setInterval(() => {
        data.locations.forEach(location => updateStrip(location, count % 2 == 0 ? data.color : 'blue'));

        setTimeout(() => stripHandler.strip.show(), 100);

        count++;

        if (count == 5) {
          clearInterval(blinkInterval);
        }
      }, 300);
    });
    
    socket.on('board-reset', () => {
      console.log("Resetting board");
      resetStrip();
    })

    socket.on('board-blink-point', data => {
      let count = 0;
      let blinkInterval = setInterval(() => {
        updateStrip(data.location, count % 2 == 0 ? data.postColor : data.preColor);

        setTimeout(() => stripHandler.strip.show(), 100);

        count++;

        if (count == 5) {
          clearInterval(blinkInterval);
        }
      }, 300);
      stripHandler.strip.show();
    });

    socket.on('connection-result', data => {
      console.log("Local socket connection result : ", data.message);
    });
  });

  
function registerBoard() {
  console.log("Adding board", socket.id);

  board = new five.Board({id: socket.id});
  
  board.on("ready", function () {
    console.log("board ready, attempting to connect to player")
    socket.emit("connect-board");
    stripHandler = {
      id: socket.id,
      strip: new pixel.Strip({      
                    data: 11,
                    length: 100,
                    color_order: pixel.COLOR_ORDER.RGB,
                    board: this,
                    controller: "FIRMATA",
                  })
    };

    stripHandler.strip.on("ready", function () {
      lightBoard();
    });

    this.on('exit', function() {
      console.log("exiting");
    })
  });
}

function blinkPoint(location, postColor = 'green', preColor = 'blue') {
    let count = 0;
    let blinkInterval = setInterval(() => {
      updateStrip(location, count % 2 == 0 ? postColor : preColor);

      setTimeout(() => stripHandler.strip.show(), 100);

      count++;

      if (count == 5) {
        clearInterval(blinkInterval);
      }
    }, 300);
    stripHandler.strip.show();
}

function updateStrip(location, color = 'blue') {
  let calculatedPosition = location.x % 2 == 0 ?
    location.x * 10 + location.y :
    location.x * 10 + (9 - location.y);

    calculatedPosition >= 0 && calculatedPosition <= 99
    ? stripHandler.strip.pixel(calculatedPosition).color(color)
    : console.log(`Invalid position: ${calculatedPosition}(`,calculatedPosition,')');
}

function lightBoard() {
  let count = 0,
    up = true,
    color = 'green',
    done;

  let boardInterval = setInterval(() => {
    stripHandler.strip.pixel(count).color(color == 'blue' ? 'blue' : count % 3 == 0 ? 'green' : 'red');
    stripHandler.strip.show();

    up ? count++ : count--;

    if (count == 99 || count < 0) {
      if (done) clearInterval(boardInterval);

      color = 'blue';
      up = !up;
      done = true;
    }
  }, 15);
}

//Obsolete
function addBoard() {
  console.log("Adding board", socket.id);    
  
  if(board) {
    console.log("Reassigning board id")
    board.id = id;

    if(stripHandler.strip) {
      console.log("Reassigning strip id")
      stripHandler.strip.id = socket.id;
      resetStrip();
    }    
    return;
  }

  board = new five.Board({id: socket.id});  
  
  board.on("ready", function () {
    stripHandler = { 
      id: id,
      strip: new pixel.Strip({      
                    data: 11,
                    length: 100,
                    color_order: pixel.COLOR_ORDER.RGB,
                    board: this,
                    controller: "FIRMATA",
                  })
    };

    if(!stripHandler.strip) return;

    stripHandler.strip.on("ready", function () {
      lightBoard();
    });

    this.on('exit', function() {
      console.log("exiting");
    })
  });
}

function resetStrip(color = 'blue') {
  stripHandler.strip.color(color);
  stripHandler.strip.show();
}