const five = require('johnny-five');
const path = require('path');
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const pixel = require("./pixel.js");
const port = 3000;

app.use(express.static(path.join(__dirname, 'server')));
const colors = ["red", "green", "blue"];
let board = new five.Board();
let strip, boardInterval;

const STATES = {
  waiting: 'waiting',
  setup: 'setup',
  ready: 'in-progress',
  done: 'done'
}

let session = [];
let gameState = STATES.waiting;

board.on("ready", function () {
  strip = new pixel.Strip({
    data: 11,
    length: 50,
    color_order: pixel.COLOR_ORDER.RGB,
    board: this,
    controller: "FIRMATA",
  });

  strip.on("ready", function () {
    console.log("Strip ready");
    let count = 0,
        up = true,
        color = 'green',
        done;

    let boardInterval = setInterval(() => {        
      strip.pixel(count).color(color);
      strip.show();

      up ? count++ : count--;

      if(count == 49 || count < 0) {            
        if(done) clearInterval(boardInterval);
        
        color = 'blue';
        up = !up;
        done = true;
      }           
    }, 50);              
  });
});

//Socket IO pub/sub definitions
io.on('connection', socket => {
  console.log("New connection, id: ", socket.id)

  //LED board setup/commands    
  socket.on('join', () => console.log("Strip connection established."));

  socket.on('set-strip', color => {
    strip.color(color);
    strip.show();
  })

  socket.on('update-strip', data => data.locations.forEach(location => updateStrip(location, data.color)));

  socket.on('blink', data => data.locations.forEach(location => blinkStrip(location, data.color)))

  //Game setup
  socket.on('add-player', () => {
    let connectionResult = placePlayer(socket.id);

    if (connectionResult.gameReady) {
      let playerOneId = session.filter(player => player.id !== socket.id)[0].id;

      let playerOneUpdate = {
        gameReady: connectionResult.gameReady,
        message: `Starting game, playing against ${session[1].name}`,
        isTurn: true
      }

      gameState = STATES.setup;

      io.to(playerOneId).emit('connection-result', playerOneUpdate);
      io.to(playerOneId).emit('game-state-changed', gameState);
    }

    socket.emit('connection-result', connectionResult);
    socket.emit('game-state-changed', gameState);
  })

  //Game start
  socket.on('setup-complete', () => {
    let player = session.find(player => player.id === socket.id);
    player.ready = true;

    if (session[0].ready && session[1].ready) {
      io.emit('game-ready', {
        state: STATES.ready,
        message: 'All set! Begin the Battle!'
      });
    } else {
      socket.emit('game-ready', {
        state: STATES.waiting,
        message: 'All set! Waiting for other player...'
      })
    }
  })

  socket.on('set-ship', updatedPositions => {
    console.log("position: ", updatedPositions);
  })

  socket.on('shot-fired', location => {
    updateStrip(location, 'red')

    let recipientId = session.filter(player => player.id !== socket.id)[0].id;
    io.to(recipientId).emit('shot-received', location);
  });

  socket.on('state-changed', state => {
    console.log("state change caught on server, new state: ", state);
  })

  //Game end
  socket.on('game-lost', () => {
    let winnerId = session.filter(player => player.id !== socket.id)[0].id;

    socket.emit('game-end', {
      state: STATES.done,
      message: 'You have lost the battle...'
    });

    io.to(winnerId).emit('game-end', {
      state: STATES.done,
      message: 'You have won the battle!!!'
    });
  })

  //This is fired on window close/refresh(client side)
  socket.on('disconnect', () => {
    session = session.filter(player => player.id !== socket.id);
  });

  //This is for testing basic socket i/o connection
  socket.on('test', data => {
    let test = {
      data: data
    };
    test.newData = 'New Data';

    socket.emit('test', test);
  });
});

function blinkStrip(location, postColor = 'green', preColor = 'blue') {
  let count = 0;

  let blinkInterval = setInterval(() => {

    count % 2 == 0
    ? updateStrip(location, preColor)
    : updateStrip(location, postColor);

    count++; 
    if(count == 6){
      clearInterval(blinkInterval);
    }
  }, 200);      
}

function updateStrip(location, color = 'blue') {
  let calculatedPosition = location.x * 10 + location.y;

  if (calculatedPosition != '') {
    if (calculatedPosition >= 0 && calculatedPosition <= 49) {
      console.log('setting position: ', calculatedPosition)
      strip.pixel(calculatedPosition).color(color);
      strip.show();
    } else {
      console.log("Invalid position");
    }
  }
}

function placePlayer(id) {
  if (!session.length) {
    session[0] = {
      id: id,
      name: 'Player 1',
      ready: false
    };

    return {
      gameReady: false,
      message: 'Waiting for other player to join...'
    };
  }
  session[1] = {
    id: id,
    name: 'Player 2',
    ready: false
  };

  return {
    gameReady: true,
    message: `Starting game... playing against ${session[0].name}`,
    isTurn: false
  };
}

server.listen(port, (err) => {
  if (err) {
    return console.log(`Error listening to port ${port}:`, err)
  }
  console.log(`Server is listening on ${port}.`)
})
