# Battleship CMPS-375

## Getting Started
* Install Node.([Nodejs]())
* Open a new command prompt and navigate to the program's folder.
* Enter ```npm install``` to install program dependencies.
* To run the full project, with the server and the Angular 2 project, enter:
    ``` npm start ``` 
* To run the webpage by itself, enter ```ng serve```.
* To run the server only ,with live-reloading (the server will restart on file changes), run:        
    ```npm run dev-server```

    ![Image unavailable][npm-start]
    *Note: Nodemon must be installed to run dev-server.

* To run the server without live-reloading, run: 
        
    ```npm run server```

## Available Commands

| Command                 | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|  
|```npm start```          | Start the server and web application with live reloading disabled(server).  |
|```npm run dev-start```  | Start the server and web application with live reloading enabled.           |
|```ng serve```           | Start the web application only with live reloading enabled.                 |
|```npm run dev-server``` | Start the server only with live reloading enabled.                          |
|```npm run server```     | Start the server with live reloading disabled.                              |
|

[npm-start]: ./resources/images/npm-start.png
[npm-run-base]: ./resources/images/npm-run-base.png