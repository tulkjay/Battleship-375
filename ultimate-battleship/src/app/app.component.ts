import { Component} from '@angular/core';

export class Square {
  selected: boolean;
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.selected = false;
    this.x = x;
    this.y = y;
  }
}

export class Row {
  squares: Array<Square>;
  constructor(x: number) {
    this.squares = new Array(10);
    for (let y = 0; y < 10; y++) {
      this.squares[y] = new Square(x, y);
    }
  }
}

export class Grid {
  rows: Array<Row>;
  constructor() {
    this.rows = new Array(10);
    for (let i = 0; i < 10; i++) {
      this.rows[i] = new Row(i);
    }
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Ultimate Battleship';
  shotCount: number;
  grid: Grid;

  constructor() {
    this.grid = new Grid();
    this.shotCount = 0;
  }

  fire(square: Square): void {
    if (square.selected) return;
    square.selected = true;
    this.shotCount++;
  }
}
