const express = require('express')  
const app = express()
const port = 3000;

app.get('/', (request, response) => {  
  response.send("Successful request")
})

app.listen(port, (err) => {  
  if (err) {
    return console.log(`Error listening to port ${port}:`, err)
  }
  console.log(`Server is listening on ${port}`)
})