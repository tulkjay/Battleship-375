export class Ship {
  name: string;
  size: number;
  position: {
    x:number, 
    y: number
  }

  constructor(name:string, size:number) {
    this.name = name;
    this.size = size;
  }
}

export class BoardSetup {
  ships : {
    carrier: Ship;
    battleship: Ship;
    cruiser: Ship;
    submarine: Ship;
    destroyer: Ship;
  }  

  constructor(){
    this.ships = {
      carrier: new Ship('Carrier', 5),
      battleship: new Ship('Battleship', 4),
      cruiser: new Ship('Cruiser', 3),
      submarine: new Ship('Submarine', 3),
      destroyer: new Ship('Destroyer', 2)
    }
  }

  setLocation(ship:Ship, position) {
    this.ships[ship.name].position = position;
  }
}
export class Game {
  constructor() {

  }
}