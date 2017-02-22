import {Component, Input} from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { GameService } from '../../services/game.service';
import { MessageService } from '../../services/message.service';
import { Ship, Row, Square, Message} from '../../models';

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
  orientation: string;
  boardKey:Array<string>;  
  shipsKey:Array<any>;
  selectedShipKey:number;

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
    this.shipListener = gameService.ShipStream.subscribe(ship => this.setShip(ship))    
    this.keyStrokeListener = gameService.KeyStream.subscribe(key => this.applyKeyStroke(key))
    this.constructBoard(); 
    this.setShip(this.shipsKey[0].ship);
  }  

  applyKeyStroke(key:string) {
    if(!this.selectedShip) return;
    switch (key) {
      case 'Up':
        this.moveShip(0, -1);
        break;
      case 'Down':
        this.moveShip(0, 1);
        break;
      case 'Left':
        this.moveShip(-1, 0);
        break;
      case 'Right':
        this.moveShip(1, 0);
        break;
      case 'Home':
        this.swapOrientation();   
        break;
      case 'Enter':
        this.lockShip()
        break;
      case 'End':
        this.changeSelectedShip(-1);
        break;
      case 'PageDown':
        this.changeSelectedShip(1);
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

  unlockShip() {

  }

  lockShip() {
    let valid = true;

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
      }
    } else if(this.orientation === 'row') {
      for(let i = 0; i < this.selectedShip.size; i++) {
        this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].locked = true;
        this.boardKey.push(`${this.selectedShip.position.x + i}${this.selectedShip.position.y}`)  
      }
    }

    this.shipsKey[this.selectedShipKey].isLocked = true;

    //Move to the next available ship   
    let nextRemainingShipKey = this.shipsKey.filter(item => !item.isLocked)[0]; 
    if(nextRemainingShipKey) {
      this.selectedShipKey = this.shipsKey.indexOf(nextRemainingShipKey);
      this.setShip(this.shipsKey[this.selectedShipKey].ship);    
    }  
    else{
      this.messageService.send(new Message('All set! Waiting for other player...'));
      this.selectedShip = null;
    }      
  }

  constructBoard() {
    this.rows = new Array(10);
        
    for (let i = 0; i < 10; i++) {
      this.rows[i] = new Row(i);
    }    
  }

  swapOrientation(){
    if(this.orientation === 'column') {
      if(this.selectedShip.position.x <= (10 - this.selectedShip.size)) {
        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = false;                          
        }
        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = true;
        } 
      
        this.orientation = 'row';
      }
    }
    else {
      if(this.selectedShip.position.y <= (10 - this.selectedShip.size)) {
        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = false;                          
        }
        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = true;
        } 
        this.orientation = 'column'
      }
    }
  }

  removeSelectedShip(){
    if(this.orientation === 'column') {
      for(let i = 0; i < this.selectedShip.size; i++) {
        this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = false;                          
      }
    } else if(this.orientation === 'row') {
      for(let i = 0; i < this.selectedShip.size; i++) {
        this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = false;                          
      }
    }
  }

  moveShip(x?:number, y?:number) {
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

        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = true;
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

        for(let i = 0; i < this.selectedShip.size; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = true;
        }
      } 
  }

  setShip(ship:Ship, x?:number, y?:number) {
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
    for(let i = startingRow; i < ship.size; i++) {
      this.rows[i].squares[startingColumn].selected = !this.rows[i].squares[startingColumn].selected;
    }        
    this.selectedShip.position.x = startingColumn;
    this.selectedShip.position.y = startingRow;
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

  dropShip(event:any){
    event.preventDefault();
    var ship = JSON.parse(event.dataTransfer.getData('ship'));
    
    this.gameService.setSelectedShip(ship);
  }

  allowShipSet(ship:any){
    ship.preventDefault();
  }
  
  fire(square: Square, shotCount: number): number {
    if (square.selected || !this.socketService.isTurn()) return shotCount;
        
    square.selected = true;
    this.socket.emit('shot-fired', square);
    this.socketService.changeTurn();

    return shotCount++;
  }
}