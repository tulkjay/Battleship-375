const five = require('johnny-five');
const path = require('path');
const express = require('express')  
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
var pixel = require("./pixel.js");
const port = 3000;

var opts = {};
opts.port = process.argv[2] || "";

var board = new five.Board(opts);
var strip = null;
const fps = 1; // how many frames per second do you want to try?

board.on("ready", function() {

    console.log("Board ready, lets add light");

    strip = new pixel.Strip({
        data: 11,
        length: 50,
        color_order: pixel.COLOR_ORDER.RGB,
        board: this,
        controller: "FIRMATA",
    });

    strip.on("ready", function() {

        console.log("Strip ready, let's go");

        var colors = ["red", "green", "blue", "yellow", "cyan", "magenta", "white"];
        let count = 1;

        strip.color("blue");
        strip.show();
        console.log("All done")
    });

    // io.on('connection', function(client) {
    //     console.log("Connection successful")
    //     client.on('join', function(handshake) {
    //     //client.emit("test", {message: "test"});
            
    //         console.log(handshake);
    //     });

    //     // Set initial state
    //     var state = {
    //         red: 1, green: 1, blue: 1
    //     };
        
        
    //     client.on('rgb', function(data) {
    //         console.log("data received: ", data);
    //         // Set the new colors
    //         if(data.position != '') {
    //             var position = parseInt(data.position);
    //             if(position >= 0 && position <= 49) {
    //                 strip.pixel(position).color(data.color);
    //                 strip.show();
    //             } else {
    //                 console.log("Invalid position");
    //             }
    //         } else {
    //             strip.color(data.color);
    //             strip.show();
    //         }

    //         client.emit('rgb', data);
    //         client.broadcast.emit('rgb', data);
    //     });

    //     client.on('color', function(data) {
    //         strip.pixel(5).color(data.color);
    //         strip.show();

    //         client.emit('color', data);
    //         client.broadcast.emit('color', data);
    //     })
    // });
});

app.use(express.static(path.join(__dirname, 'server')));

const STATES = {
  waiting: 'waiting', 
  setup: 'setup', 
  ready: 'in-progress', 
  done: 'done'    
}

let session = [];
let gameState = STATES.waiting;

//Socket IO pub/sub definitions
io.on('connection', socket => {
  console.log("Connection successful")
  
  socket.on('join', function(handshake) {
    socket.emit("test", {message: "test"});          
    console.log(handshake);
  });

        // Set initial state
  var state = {
      red: 1, green: 1, blue: 1
  };
  
        
  socket.on('rgb', function(data) {
    console.log("data received: ", data);
        // Set the new colors
        if(data.position != '') {
            var position = parseInt(data.position);
            if(position >= 0 && position <= 49) {
                strip.pixel(position).color(data.color);
                strip.show();
            } else {
                console.log("Invalid position");
            }
        } else {
            strip.color(data.color);
            strip.show();
        }

        socket.emit('rgb', data);
        socket.broadcast.emit('rgb', data);
    });

    socket.on('color', function(data) {
        strip.pixel(5).color(data.color);
        strip.show();

        socket.emit('color', data);
        socket.broadcast.emit('color', data);
    })

  console.log("New connection, id: ", socket.id)    
  socket.emit('rgb', {test: 'this is just a test'});
  //Game setup
  socket.on('add-player', () => {   
    let connectionResult = placePlayer(socket.id);

    if(connectionResult.gameReady) { 
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

    if(session[0].ready && session[1].ready) {
      io.emit('game-ready', {state: STATES.ready, message: 'All set! Begin the Battle!'});      
    } else {
      socket.emit('game-ready', {state: STATES.waiting, message: 'All set! Waiting for other player...' })
    }
  })  

  socket.on('shot-fired', location => {
  
    //Convert to character or do whatever to let the leds know what to do.
  
    let recipientId = session.filter(player => player.id !== socket.id)[0].id;  
    io.to(recipientId).emit('shot-received', location);
  });

  socket.on('state-changed', state => {
    console.log("state change caught on server, new state: ", state);    
  })
  
  //Game end
  socket.on('game-lost', () => {    
    let winnerId = session.filter(player => player.id !== socket.id)[0].id;
    
    socket.emit('game-end', {state: STATES.done, message: 'You have lost the battle...'});
    
    io.to(winnerId).emit('game-end', {state: STATES.done, message: 'You have won the battle!!!'});
  })

  //This is fired on window close/refresh(client side)
  socket.on('disconnect', () => {
    session = session.filter(player => player.id !== socket.id);
  });

  //This is for testing basic socket i/o connection
  socket.on('test', data => {
    let test = {data: data};
    test.newData = 'New Data';
    
    socket.emit('test', test);
  });
});
function placePlayer(id) {  
  if(!session.length) {
    session[0] = {
      id: id, 
      name: 'Player 1', 
      ready: false
    };

    return { 
      gameReady:false,
      message: 'Waiting for other player to join...'};
  }
  session[1] = {
      id: id, 
      name: 'Player 2', 
      ready: false
    };  

  return { 
    gameReady:true, 
    message: `Starting game... playing against ${session[0].name}`, 
    isTurn: false};
}

server.listen(port, (err) => {  
  if (err) {
    return console.log(`Error listening to port ${port}:`, err)
  }
  console.log(`Server is listening on ${port}`)
})

