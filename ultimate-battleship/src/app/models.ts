export class Message{
  message: string;
  active: boolean;

  constructor(text?: string){
    this.message = text;
    this.active = true;
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

export class Ship {
  name: string;
  size: number;
  position: {
    x:number, 
    y: number, 
  }

  constructor(name?:string, size?:number) {
    this.name = name;
    this.size = size;
  }
}

export class Square {
  selected: boolean;
  x: number;
  y: number;  
  locked: boolean;
  text: string;
  constructor(x: number, y: number, text?: string) {
    this.selected = false;
    this.x = x;
    this.y = y;
    this.locked = false;
    this.text = text;
  }
}