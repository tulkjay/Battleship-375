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

export class Grid {
  rows: Array<Row>;
  constructor() {
    this.rows = new Array(10);
    for (let i = 0; i < 10; i++) {
      this.rows[i] = new Row(i);
    }
  }

  fire(square: Square, shotCount: number): number {
    if (square.selected) return shotCount;
    square.selected = true;
    return shotCount++;
  }
}
