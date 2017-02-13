import {Component, Input} from '@angular/core';
import { SocketService } from'../../services/socket.service';

@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
})

export class GridComponent {
  rows: Array<Row>;  
  socket: SocketIOClient.Socket;

  constructor(private socketService: SocketService) {    
    this.socket = this.socketService.getConnection();
    this.rows = new Array(10);
    
    for (let i = 0; i < 10; i++) {
      this.rows[i] = new Row(i);
    }
    
    this.socket.on('shot-received', location => console.log('Shot received:', location));
  }  

  onKey(event) {
    console.log("Key presses")
  }

  fire(square: Square, shotCount: number): number {
    if (square.selected) return shotCount;
    square.selected = true;
    this.socket.emit('shot-fired', square);
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