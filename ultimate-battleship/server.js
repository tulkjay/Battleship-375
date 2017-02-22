const path = require('path');
const express = require('express')  
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 3000;

app.use(express.static(path.join(__dirname, 'server')));
let session = [];

//Socket IO pub/sub definitions
io.on('connection', socket => {    
  console.log("New connection, id: ", socket.id)  

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
      
      io.to(playerOneId).emit('connection-result', playerOneUpdate);            
    }    
    
    socket.emit('connection-result', connectionResult);          
  })

  socket.on('setup-complete', () => {
    if(session[0].ready && session[1].ready) {
      socket.emit('game-ready');
    }
  })  

  //Game start
  socket.on('shot-fired', location => {
    
    //Convert to character or do whatever to let the leds know what to do.
  
    let recipientId = session.filter(player => player.id !== socket.id)[0].id;  
    io.to(recipientId).emit('shot-received', location);
  })
  
  //Game end
  socket.on('game-lost', () => {    
    let winnerId = session.filter(player => player.id !== socket.id)[0].id;
    
    socket.emit('game-end', 'You have lost the battle...');
    
    io.to(winnerId).emit('game-end', 'You have won the battle!!!')
  })

  //This is fire on window close/refresh(client side)
  socket.on('disconnect', () => {
    session = session.filter(player => player.id !== socket.id);
  });
})

function placePlayer(id) {  
  if(!session.length) {
    session[0] = {
      id: id, 
      name: 'Player 1'
    };

    return { 
      gameReady:false,
      message: 'Waiting for other player to join...'};
  }
  session[1] = {
      id: id, 
      name: 'Player 2'
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

