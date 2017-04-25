import { Component, Input } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { GameService } from '../../services/game.service';
import { MessageService } from '../../services/message.service';
import { Ship, Row, Square, Message } from '../../models';

@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
})

export class GridComponent {
  rows: Array<Row>;  
  socket: SocketIOClient.Socket;
  turn: boolean;
  selectedShip: Ship;
  shipListener:any;
  keyStrokeListener:any;
  gameStateListener:any;
  orientation: string;
  boardKey:Array<string>;  
  shipsKey:Array<any>;
  selectedShipKey:number;
  selectedPosition:any;

  constructor(private socketService: SocketService, private gameService: GameService, private messageService: MessageService) {        
    this.shipsKey = [
      { ship: new Ship('carrier', 5), 
        lockedLocation: [{x:0,y:0}], 
        isLocked:false
      },
      { ship: new Ship('battleship', 4), 
        lockedLocation: [{x:0,y:0}], 
        isLocked:false
      },      
      { ship: new Ship('cruiser', 3), 
        lockedLocation: [{x:0,y:0}], 
        isLocked:false
      },
      { ship: new Ship('submarine', 3), 
        lockedLocation: [{x:0,y:0}], 
        isLocked:false
      },
      { ship: new Ship('destroyer', 2), 
        lockedLocation: [{x:0,y:0}], 
        isLocked:false
      }    
    ];
    this.selectedShipKey = 0;
    this.orientation = 'column';
    this.boardKey = [];
    this.socket = this.socketService.getConnection();
    this.shipListener = gameService.ShipStream.subscribe(ship => this.setShip(ship));    
    this.gameStateListener = gameService.GameStateStream.subscribe(gameState => this.gameStateChanged(gameState));    
    this.keyStrokeListener = gameService.KeyStream.subscribe(key => this.applyKeyStroke(key));        

    this.constructBoard(); 
  }  

  gameStateChanged(state: string) {    
    switch (state) {
      case 'setup':      
        this.setShip(this.shipsKey[0].ship);
        break;
      case 'in-progress':
        this.selectedPosition = {x:0, y:0};
        this.rows[0].squares[0].selected = true;      
      case 'done':
        console.log("Time to lock everything down")
        break;
      default:
        console.log("State handler not configured for state: ", state);
        break;
    }
  }

  applyKeyStroke(key:string) {
    let state = this.gameService.getGameState();    
    if(!this.selectedShip && state !== 'in-progress') return;    

    switch (key) {
      case 'Up':
        if(state === 'setup'){
          this.moveShip(0, -1);
        } else if(state === 'in-progress') {
          this.moveTarget(0, -1);
        }        
        break;
      case 'Down':
        if(state === 'setup'){
          this.moveShip(0, 1);
        } else if(state === 'in-progress') {
          this.moveTarget(0, 1);
        }   
        break;
      case 'Left':
        if(state === 'setup'){
          this.moveShip(-1, 0);
        } else if(state === 'in-progress') {
          this.moveTarget(-1, 0);
        }   
        break;
      case 'Right':
        if(state === 'setup'){
          this.moveShip(1, 0);
        } else if(state === 'in-progress') {
          this.moveTarget(1, 0);
        } 
        break;
      case 'Home':
        if(state === 'setup'){
          this.swapOrientation();   
        } 
        break;
      case 'Enter':
        if(state === 'setup'){
          this.lockShip()
        } else if(state === 'in-progress') {
          this.fire(this.rows[this.selectedPosition.y].squares[this.selectedPosition.x]);
        } 
        break;
      case 'End':
        if(state === 'setup'){
        this.changeSelectedShip(-1);
        }       
        break;
      case 'PageDown':
        if(state === 'setup'){
          this.changeSelectedShip(1);
        }
        break;
      default:
        break;
    }
  }

  changeSelectedShip(direction:number) {        
    if(direction < 0 && !(this.shipsKey[0].ship.name === this.selectedShip.name)) {
      let unlockedShipKey = this.shipsKey.filter((item, index) => index <= this.selectedShipKey + direction && !item.isLocked);
      
      if(!unlockedShipKey[unlockedShipKey.length - 1]) return;
      
      this.removeSelectedShip();
      this.selectedShipKey += direction;

      let previousShip = this.shipsKey.filter((ship, index) => index === this.selectedShipKey)[0];
      
      this.setShip(previousShip.ship);
    } else if( direction > 0 && !(this.shipsKey[4].ship.name === this.selectedShip.name)) {
      
      let unlockedShipKey = this.shipsKey.filter((item, index) => index >= this.selectedShipKey + direction && !item.isLocked)[0];
      if(!unlockedShipKey) return;
      
      this.removeSelectedShip();
      this.selectedShipKey += direction;   

      let nextShip = this.shipsKey.filter((ship, index) => index === this.selectedShipKey)[0];
      
      this.setShip(nextShip.ship);
    }    
  }

  moveTarget(x:number, y:number) {    
    if(this.selectedPosition.x + x < 0 
        || this.selectedPosition.x + x > 9 
        || this.selectedPosition.y + y < 0 
        || this.selectedPosition.y + y > 9) return;
    
    this.rows[this.selectedPosition.y].squares[this.selectedPosition.x].selected = false;

    this.selectedPosition.x += x;
    this.selectedPosition.y += y;

    this.rows[this.selectedPosition.y].squares[this.selectedPosition.x].selected = true;        
  }

  lockShip() {
    let valid = true;
    let locations = [];
    //Check if space is occupied
    if(this.orientation === 'column') {
      for(let i = 0; i < this.selectedShip.size; i++) {        
        if(this.boardKey.find(location => location === `${this.selectedShip.position.x}${this.selectedShip.position.y + i}`)) {          
          console.log("Cannot lock location, it is already occupied!");
          valid = false;          
          return;
        }     
      }
    } else if(this.orientation === 'row') {
      for(let i = 0; i < this.selectedShip.size; i++) {
        if(this.boardKey.find(location => location === `${this.selectedShip.position.x + i}${this.selectedShip.position.y}`)) {          
          console.log("Cannot lock location, it is already occupied!");
          valid = false;
          return;
        }        
      }
    }
      if(!valid) return;
    
    //Lock location    
    if(this.orientation === 'column') {
      for(let i = 0; i < this.selectedShip.size; i++) {
        this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].locked = true;
        this.boardKey.push(`${this.selectedShip.position.x}${this.selectedShip.position.y + i}`)
        locations.push(this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x]);
      }
    } else if(this.orientation === 'row') {
      for(let i = 0; i < this.selectedShip.size; i++) {
        this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].locked = true;
        this.boardKey.push(`${this.selectedShip.position.x + i}${this.selectedShip.position.y}`)  
        locations.push(this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i]);        
      }
    }
    this.syncBoard(locations, 'green', 'blink-strip');
    this.shipsKey[this.selectedShipKey].isLocked = true;

    //Move to the next available ship   
    let nextRemainingShipKey = this.shipsKey.filter(item => !item.isLocked)[0]; 
    if(nextRemainingShipKey) {
      this.selectedShipKey = this.shipsKey.indexOf(nextRemainingShipKey);
      this.setShip(this.shipsKey[this.selectedShipKey].ship);    
    }  
    else{      
      this.socketService.emit('setup-complete', this.boardKey);      
      this.selectedShip = null;
      this.constructBoard();
    }      
  }

  constructBoard() {
    this.rows = new Array(10);
        
    for (let i = 0; i < 10; i++) {
      this.rows[i] = new Row(i);
    }    
  }

  swapOrientation() {
    let unsetLocations = [];
    let setLocations = [];

    if(this.orientation === 'column') {
      if(this.selectedShip.position.x <= (10 - this.selectedShip.size)) {
        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = false;   
          unsetLocations.push(this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x]);                        
        }
        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = true;
          setLocations.push(this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i]);                        
        } 
      
        this.orientation = 'row';
      }
    }
    else {
      if(this.selectedShip.position.y <= (10 - this.selectedShip.size)) {
        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = false;    
          unsetLocations.push(this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i]);                      
        }
        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = true;
          setLocations.push(this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x]);                        
        } 
        this.orientation = 'column'
      }
    }
    this.syncBoard(unsetLocations);
    this.syncBoard(setLocations, 'red');
  }

  syncBoard(locations, color:string = 'blue', command:string = 'update-strip') {
    this.socketService.emit(command, {locations: locations, color: color});        
  }
  
  removeSelectedShip() {  
    let locations = [];
    this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x].text = null;

    if(this.orientation === 'column') {
      for(let i = 0; i < this.selectedShip.size; i++) {
        this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = false;                          
        locations.push(this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x]);
      }
    } else if(this.orientation === 'row') {
      for(let i = 0; i < this.selectedShip.size; i++) {
        this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = false;                          
        locations.push(this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i]);
      }
    }

    //locations.unshift({x:this.selectedShip.position.y, y: this.selectedShip.position.x});
    this.syncBoard(locations, 'blue');
  }

  moveShip(x?:number, y?:number) {
      let locations = [];

      if(this.orientation === 'column') {
        this.removeSelectedShip();
        
        if(x < 0 ) {
          this.selectedShip.position.x > 0 ? this.selectedShip.position.x += x : this.selectedShip.position.x;
        } else if(x > 0) {
          this.selectedShip.position.x < 9 ? this.selectedShip.position.x += x : this.selectedShip.position.x;
        }

        if(y < 0) {
          this.selectedShip.position.y > 0 ? this.selectedShip.position.y += y : this.selectedShip.position.y;
        } else if(y > 0) {
          this.selectedShip.position.y <= (9 - this.selectedShip.size) ? this.selectedShip.position.y += y : this.selectedShip.position.y;
        }
        if(!this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x].text)
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x].text = this.selectedShip.name;
        

        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = true;
          locations.push(this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x])
        }
      }
      else if(this.orientation === 'row') {
        this.removeSelectedShip();
        
        if(x < 0 ) {
          this.selectedShip.position.x > 0 ? this.selectedShip.position.x += x : this.selectedShip.position.x;
        } else if(x > 0) {
          this.selectedShip.position.x <= (9 - this.selectedShip.size) ? this.selectedShip.position.x += x : this.selectedShip.position.x;
        }

        if(y < 0) {
          this.selectedShip.position.y > 0 ? this.selectedShip.position.y += y : this.selectedShip.position.y;
        } else if(y > 0) {
          this.selectedShip.position.y < 9 ? this.selectedShip.position.y += y : this.selectedShip.position.y;
        }
        
        if(!this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x].text)
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x].text = this.selectedShip.name;
        
        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = true;
          locations.push(this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i]);
        }
      }

      this.syncBoard(locations, 'red'); 
  }

  setShip(ship:Ship, x?:number, y?:number) {
    if(this.gameService.getGameState() !== 'setup') return;

    let startingPosition = 0;
    this.selectedShip = ship;
    this.selectedShip.position = {x: 0, y: 0};
    this.orientation = 'column';

    let valid = true;
    let startingRow = 0; 
    let startingColumn = 0;

    do {
      valid = true;
      for(let i = startingRow; i < ship.size; i++) {
        if(this.boardKey.find(location => location === `${startingColumn}${i}`)) {
          valid = false;          
        }
      }

      if(!valid) {
        startingColumn++;
        if(startingColumn === 10 - ship.size) {
          startingRow++;
          startingColumn = 0;
        }      
      }      
    } while(!valid);

    //Set starting ship position
    let updatedLocations = [];

    for(let i = startingRow; i < ship.size; i++) {
      this.rows[i].squares[startingColumn].selected = !this.rows[i].squares[startingColumn].selected;
      updatedLocations.push({ x:i, y:startingColumn });
    }        
    this.selectedShip.position.x = startingColumn;
    this.selectedShip.position.y = startingRow;
    this.rows[startingRow].squares[startingColumn].text = this.selectedShip.name;
    
    updatedLocations.unshift({ y:startingColumn, x:startingRow });
    this.syncBoard(updatedLocations, 'red', 'update-strip')    
  }

  getSquareColor(square:Square) {    
    if(square.locked) {
      return 'chartreuse';
    }
    else if(square.selected) {
      return 'red'
    }
    else {
      return 'cornflowerblue'
    }     
  }

  dropShip(event:any) {
    if(this.gameService.getGameState() !== 'setup') return;

    event.preventDefault();
    try {
      var ship = JSON.parse(event.dataTransfer.getData('ship'));
      this.gameService.setSelectedShip(ship);
    } 
    finally {
      console.log("Invalid item drop.")
      return;
    } 
  }

  allowShipSet(ship:any){
    ship.preventDefault();
  }
  
  fire(square?: Square, shotCount?: number): number {
    if (square.locked || !this.socketService.isTurn() || this.gameService.getGameState() !== 'in-progress') return shotCount;
    
    var audio = new Audio('../../../assets/missileLaunch.wav');
    audio.play();

    square.locked = true;
    this.socket.emit('shot-fired', square);
    this.socketService.setTurn(false);

    return shotCount++;
  }
}