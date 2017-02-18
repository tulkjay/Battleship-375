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

  constructor(private socketService: SocketService, private gameService: GameService) {    
    this.socket = this.socketService.getConnection();
    this.shipListener = gameService.ShipStream.subscribe(ship => this.setShip(ship))    
    this.keyStrokeListener = gameService.KeyStream.subscribe(key => this.applyKeyStroke(key))
    this.constructBoard();
  }  

  applyKeyStroke(key:string) {
    console.log("Key caught", key);
    switch (key) {
      case 'Up':
        this.setShip(this.selectedShip, 0, -1);
        break;
      case 'Down':
        this.setShip(this.selectedShip, 0, 1);
        break;
      case 'Left':
        this.setShip(this.selectedShip, 1, 0);
        break;
      case 'Right':
        this.setShip(this.selectedShip, -1, 0);
        break;    
      default:
        break;
    }
  }

  constructBoard() {
    this.rows = new Array(10);
        
    for (let i = 0; i < 10; i++) {
      this.rows[i] = new Row(i);
    }    
  }

  setShip(ship:Ship, x?:number, y?:number, orientationChange?:number) {
    this.selectedShip = ship;
    
    for(let i = 0; i < ship.size; i++) {
      this.rows[i].squares[0].selected = !this.rows[i].squares[0].selected;
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