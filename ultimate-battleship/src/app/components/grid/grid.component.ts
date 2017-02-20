import {Component, Input} from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { GameService } from '../../services/game.service';
import { Ship, Row, Square} from '../../models';

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

  constructor(private socketService: SocketService, private gameService: GameService) {    
    this.orientation = 'column';
    this.boardKey = [];
    this.socket = this.socketService.getConnection();
    this.shipListener = gameService.ShipStream.subscribe(ship => this.setShip(ship))    
    this.keyStrokeListener = gameService.KeyStream.subscribe(key => this.applyKeyStroke(key))
    this.constructBoard();    
  }  

  applyKeyStroke(key:string) {
    console.log("Key caught", key);
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
      default:
        break;
    }
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
    this.orientation = 'column';
    this.setShip(new Ship());    
  }

  constructBoard() {
    this.rows = new Array(10);
        
    for (let i = 0; i < 10; i++) {
      this.rows[i] = new Row(i);
    }    
  }

  swapOrientation(){
    const max = this.selectedShip.size;        

    if(this.orientation === 'column') {
      if(this.selectedShip.position.x <= (10 - this.selectedShip.size)) {
        for(let i = 0; i < max; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = false;                          
        }
        for(let i = 0; i < max; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = true;
        } 
      
        this.orientation = 'row';
      }
    }
    else {
      if(this.selectedShip.position.y <= (10 - this.selectedShip.size)) {
        for(let i = 0; i < max; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = false;                          
        }
        for(let i = 0; i < max; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = true;
        } 
        this.orientation = 'column'
      }
    }
  }

  moveShip(x?:number, y?:number) {
      const max = this.selectedShip.size; 

      if(this.orientation === 'column') {
        for(let i = 0; i < max; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = false;                          
        }
        
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

        for(let i = 0; i < max; i++) {
          this.rows[this.selectedShip.position.y + i].squares[this.selectedShip.position.x].selected = true;
        }
      }
      else if(this.orientation === 'row') {
        for(let i = 0; i < max; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = false;                          
        }
        
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

        for(let i = 0; i < max; i++) {
          this.rows[this.selectedShip.position.y].squares[this.selectedShip.position.x + i].selected = true;
        }
      } 
  }

  setShip(ship:Ship, x?:number, y?:number) {
    this.selectedShip = ship;
    this.selectedShip.position = {x: 0, y: 0};

    for(let i = 0; i < ship.size; i++) {
      this.rows[i].squares[0].selected = !this.rows[i].squares[0].selected;
    }        
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