const five = require('johnny-five');
const path = require('path');
const express = require('express')
const app = express();
//const url = '192.168.1.142';
const port = 8080;
const url = '147.174.180.135';
const hostUrl = `http:/${url}/:${port}`;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(allowCrossDomain);

const server = require('http').Server(app);
server.listen(port, url);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'server')));
const colors = ["red", "green", "blue"];

const STATES = {
  waiting: 'waiting',
  setup: 'setup',
  ready: 'in-progress',
  done: 'done'
}

let boards = [],
    session = [],
    gameState = STATES.waiting;

//Socket IO pub/sub definitions
io.on('connection', socket => {
  console.log("New connection, id: ", socket.id)

  //LED board setup/actions    
  socket.on('join', () => console.log("Strip connection established."));

  socket.on('update-strip', data => {
    let player = session.filter(player => player.id == socket.id)[0];
    
    if(!player || !player.boardId) return;
    
    io.to(player.boardId).emit('board-update-strip', data);
  });

  socket.on('blink-strip', data => {
    let player = session.filter(player => player.id == socket.id)[0];
    
    if(!player || !player.boardId) return;
    
    io.to(player.boardId).emit('board-blink-strip', data);
  });

  //Board connections
  socket.on('connect-board', () => {
    if(boards.length){
      boards[1] = socket.id;
    } else{
      boards[0] = socket.id;
    }
  });

  //Game setup
  socket.on('add-player', () => {
    console.log("Adding player: ",session);
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
    let recipient = session.filter(player => player.id !== socket.id)[0];
    let hit = false;

    if(recipient.shipsKey.find(x => x ==`${location.y}${location.x}`)) {
      hit = true;
      recipient.shipsKey.splice(recipient.shipsKey.indexOf(`${location.y}${location.x}`), 1);

      if(!recipient.shipsKey.length){
        console.log("Game over");
        let loserId = session.filter(player => player.id !== socket.id)[0].id;

        socket.emit('game-end', {
          state: STATES.done,
          message: 'You have won the battle!!!',
          won: true
        });

        io.to(loserId).emit('game-end', {
          state: STATES.done,
          message: 'You have lost the battle...',
          won: false
        });
      }
    }

    //Return results of shot
    io.to(socket.id).emit('shot-result', {success: hit});

    io.to(recipient.id).emit('shot-received', hit);    
    
    if(!recipient.boardId) return;
    
    io.to(recipient.boardId).emit('board-blink-point', { 
      location, 
      postColor: hit ? 'red' : 'orange', 
      preColor: hit ? 'green' : 'blue'
    });
  });

  socket.on('state-changed', state => {
    console.log("state change caught on server, new state: ", state);
  })

  //This is fired on window close/refresh(client side)
  socket.on('disconnect', () => {
    console.log("Session", session)
    let leavingPlayer = session.filter(player => player.id == socket.id);        
    console.log("Disconnecting", leavingPlayer)
    leavingPlayer.id = null;
    
    if(leavingPlayer.boardId){
      io.to(leavingPlayer.boardId).emit("board-reset");    
    }
  });
});

function placePlayer(id) {
  if (!session.length || !session[0].id) {
    session[0] = {
      id: id,
      name: 'Player 1',
      shipsKey: [],
      ready: false,   
      boardId: boards[0]    
    };

    return {
      gameReady: false,
      message: 'Waiting for other player to join...'
    };
  }

  session[1] = {
    id: id,
    name: 'Player 2',
    shipsKey: [],
    ready: false, 
    boardId: boards[1]
  };

  return {
    gameReady: true,
    message: `Starting game... playing against ${session[0].name}`,
    isTurn: false
  };
}



io.listen(server, (err) => {
  if (err) {
    return console.log(`Error listening to port ${port}:`, err)
  }
  console.log(`Socket connection are caught on ${port}.`)
})
