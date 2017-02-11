const path = require('path');
const express = require('express')  
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 3000;

app.use(express.static(path.join(__dirname, 'server')));

app.get('/', (request, response) => {  
  response.send("Successful request")
})

io.on('connection', socket => {  
  console.log("New connection detected")
  socket.on('emit-changes', () => {
    console.log("Connecting!")
  })
  socket.emit('connect', {message: 'Greetings'});
})

server.listen(port, (err) => {  
  if (err) {
    return console.log(`Error listening to port ${port}:`, err)
  }
  console.log(`Server is listening on ${port}`)
})