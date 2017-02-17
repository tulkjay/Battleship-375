import {Component, Input} from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { BoardSetup } from '../../models/game';

@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
})

export class GridComponent {
  rows: Array<Row>;  
  socket: SocketIOClient.Socket;
  turn: boolean;
  setup: BoardSetup;

  constructor(private socketService: SocketService) {    
    this.setup = new BoardSetup();
    this.socket = this.socketService.getConnection();
    this.rows = new Array(10);
        
    for (let i = 0; i < 10; i++) {
      this.rows[i] = new Row(i);
    }
  }  

  fire(square: Square, shotCount: number): number {
    if (square.selected || !this.socketService.isTurn()) return shotCount;
        
    square.selected = true;
    this.socket.emit('shot-fired', square);
    this.socketService.changeTurn();

    return shotCount++;
  }
}

class Square {
  selected: boolean;
  x: number;
  y: number;
  
  constructor(x: number, y: number) {
    this.selected = false;
    this.x = x;
    this.y = y;
  }
}

class Row {
  squares: Array<Square>;
  
  constructor(x: number) {
    this.squares = new Array(10);

    for (let y = 0; y < 10; y++) {
      this.squares[y] = new Square(x, y);
    }
  }
}