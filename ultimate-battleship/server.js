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
  socket.on('add-player', () => {   
    let connectionResult = placePlayer(socket.id);

    if(connectionResult.gameReady) {      
      let playerOneId = session.filter(id => id !== socket.id);    
      let playerOneUpdate = {
        gameReady: connectionResult.gameReady, 
        message: `Starting game, playing against ${socket.id}`, 
        isTurn: true
      }
      
      io.to(playerOneId).emit('connection-result', playerOneUpdate);            
    }    
    
    socket.emit('connection-result', connectionResult);          
  })  

  socket.on('shot-fired', location => {
    
    //Convert to character or do whatever to let the leds know what to do.

    let recipientId = session.filter(id => id !== socket.id);    
    io.to(recipientId).emit('shot-received', location);
  })
  
  //This is fire on window close/refresh(client side)
  socket.on('disconnect', () => {
      session = session.filter(ids => ids !== socket.id);
  });
})

function placePlayer(id) {  
  if(!session.length) {
    session[0] = id;
    return { 
      gameReady:false,
      message: 'Waiting for other player...'};
  }
  session[1] = id;  
  return { 
    gameReady:true, 
    message: `Starting game... playing against ${session[0]}`, 
    isTurn: false};
}

server.listen(port, (err) => {  
  if (err) {
    return console.log(`Error listening to port ${port}:`, err)
  }
  console.log(`Server is listening on ${port}`)
})

