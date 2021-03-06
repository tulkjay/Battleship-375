import { Ship } from '../models';

export class ShipCatalog {
  ships: Array<Ship>;
  
  constructor(){
    this.ships = [
      new Ship('carrier', 5),
      new Ship('battleship', 4),
      new Ship('cruiser', 3),
      new Ship('submarine', 3),
      new Ship('destroyer', 2),
    ]
  }

  build(shipName:string):Ship {
    switch (shipName) {
      case 'carrier':
        return new Ship('carrier', 5)
      case 'battleship':
        return new Ship('battleship', 4)
      case 'cruiser':
        return new Ship('cruiser', 3)
      case 'submarine':
        return new Ship('submarine', 3)
      case 'destroyer':
        return new Ship('destroyer', 2)
    
      default:
      console.log('Invalid ship name');
        break;
    }    
  }  
}