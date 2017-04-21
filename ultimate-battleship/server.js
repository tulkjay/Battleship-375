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

const STATES = {
  waiting: 'waiting',
  setup: 'setup',
  ready: 'in-progress',
  done: 'done'
}

let boards = [],
    strips = [],
    session = [],
    gameState = STATES.waiting;

//Socket IO pub/sub definitions
io.on('connection', socket => {
  console.log("New connection, id: ", socket.id)

  //LED board setup/actions    
  socket.on('join', () => console.log("Strip connection established."));

  socket.on('update-strip', data => {
    let match = strips.filter(strip => strip.id == socket.id)[0];
    
    if(!match || !match.strip) return;

    let strip = match.strip;

    data.locations.forEach(location => {
      if (location.locked) return;

      updateStrip(strip, location, data.color)
    })
    setTimeout(() => strip.show(), 100);
  });

  socket.on('blink-strip', data => {
    let count = 0;
    let match = strips.filter(strip => strip.id == socket.id)[0];
    
    if(!match || !match.strip) return;

    let strip = match.strip;

    let blinkInterval = setInterval(() => {
      data.locations.forEach(location => updateStrip(strip, location, count % 2 == 0 ? data.color : 'blue'));

      setTimeout(() => strip.show(), 100);

      count++;

      if (count == 5) {
        clearInterval(blinkInterval);
      }
    }, 300);
  });

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
  socket.on('setup-complete', playerBoard => {
    console.log("On setup complete: ", playerBoard);

    let player = session.find(player => player.id === socket.id);
    player.ready = true;
    player.shipsKey = playerBoard;

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

  socket.on('shot-fired', location => {
    console.log("shot fired", location);
    let recipient = session.filter(player => player.id !== socket.id)[0];
    let hit;
    if(recipient.shipsKey.find(x => x ==`${location.y}${location.x}`)) {
      console.log("Shot Made Contact!", location);
      hit = true;
      recipient.shipsKey.splice(recipient.shipsKey.indexOf(`${location.y}${location.x}`), 1);

      if(!recipient.shipsKey.length){
        console.log("Game over");
        let winnerId = session.filter(player => player.id !== socket.id)[0].id;

        socket.emit('game-end', {
          state: STATES.done,
          message: 'You have lost the battle...'
        });

        io.to(winnerId).emit('game-end', {
          state: STATES.done,
          message: 'You have won the battle!!!'
        });
      }
    }else{
      console.log("No contact", location);      
    }

    io.to(recipient.id).emit('shot-received', location);

    let match = strips.filter(strip => strip.id !== socket.id)[0];
    console.log("no match: ", !match || !match.strip);
    
    if(!match || !match.strip) return;
    
    console.log("updating")
    
    blinkPoint(match.strip, location, hit ? 'red' : 'orange', hit ? 'green' : 'blue');
    
    match.strip.show();

  });

  socket.on('state-changed', state => {
    console.log("state change caught on server, new state: ", state);
  })

  //This is fired on window close/refresh(client side)
  socket.on('disconnect', () => {
    let board = boards.filter(board => board.id === socket.id)[0];

    if(board) {
      console.log('Resetting board id');
      board.id = -1;
    }

    let strip = strips.filter(strip => strip.id === socket.id)[0];
    
    if(strip) {
      console.log('Resetting strip id');
      strip.id = -1;
    }

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

function blinkPoint(strip, location, postColor = 'green', preColor = 'blue') {
    let count = 0;
    let blinkInterval = setInterval(() => {
      updateStrip(strip, location, count % 2 == 0 ? postColor : preColor);

      setTimeout(() => strip.show(), 100);

      count++;

      if (count == 5) {
        clearInterval(blinkInterval);
      }
    }, 300);
}

function updateStrip(strip, location, color = 'blue') {
  let calculatedPosition = location.x % 2 == 0 ?
    location.x * 10 + location.y :
    location.x * 10 + (9 - location.y);

    calculatedPosition >= 0 && calculatedPosition <= 99
    ? strip.pixel(calculatedPosition).color(color)
    : console.log(`Invalid position: ${calculatedPosition}(`,calculatedPosition,')');
}

function lightBoard(strip) {
  let count = 0,
    up = true,
    color = 'green',
    done;

  let boardInterval = setInterval(() => {
    strip.pixel(count).color(color == 'blue' ? 'blue' : count % 3 == 0 ? 'green' : 'red');
    strip.show();

    up ? count++ : count--;

    if (count == 99 || count < 0) {
      if (done) clearInterval(boardInterval);

      color = 'blue';
      up = !up;
      done = true;
    }
  }, 15);
}

function resetStrip(id, color = 'blue') {
  let match = strips.filter(strip => strip.id === id)[0];
  
  match.strip.color(color);
  match.strip.show();
}

function addBoard(id) {
  let initializedBoard = boards.filter(board => board.id === -1)[0];
  
  if(initializedBoard) {
    console.log("Reassigning board id")
    initializedBoard.id = id;
    let strip = strips.filter(strip => strip.id === -1)[0];    
    if(strip) {
      console.log("Reassigning strip id")
      strip.id = id;
      resetStrip(id);
    }    
    return;
  }

  boards.push(new five.Board({id: id}));  
  
  boards[session.length - 1].on("ready", function () {
    strips.push({
      id: id,
      strip: new pixel.Strip({      
                    data: 11,
                    length: 100,
                    color_order: pixel.COLOR_ORDER.RGB,
                    board: this,
                    controller: "FIRMATA",
                  })
    });

    if(!strips[session.length - 1]) return;

    strips[session.length - 1].strip.on("ready", function () {
      lightBoard(strips[session.length - 1].strip);
    });

    this.on('exit', function() {
      console.log("exiting");
    })
  });
}

function placePlayer(id) {
  if (!session.length) {
    session[0] = {
      id: id,
      name: 'Player 1',
      shipsKey: [],
      ready: false
    };

    addBoard(id);

    return {
      gameReady: false,
      message: 'Waiting for other player to join...'
    };
  }

  session[1] = {
    id: id,
    name: 'Player 2',
    shipsKey: [],
    ready: false
  };

  addBoard(id);

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
