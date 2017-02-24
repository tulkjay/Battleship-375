import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { KeyEmitter } from '../helpers/KeyEmitter';
import { ShipEmitter } from '../helpers/ShipEmitter';
import { Ship } from '../models';

@Injectable()
 export class GameService{
   ShipStream: ShipEmitter;
   KeyStream: KeyEmitter;
   selectedShip: Ship;
   listener:any;
   state:string;

   constructor() {
    this.ShipStream = new ShipEmitter();
    this.KeyStream = new KeyEmitter();
    this.selectedShip = new Ship();    
    this.state = 'waiting';        
   }
   
   setGameState(state:string) {
    console.log("The game's state has been set to: ", state);
   }

   getGameState():string {
    return this.state;
   }
   sendKeyStroke(key:string) {
     this.KeyStream.emit(key);
   }

   sendShip(message:Ship) {
     this.ShipStream.emit(message);
   }
   
   setSelectedShip(ship:Ship) {
     this.selectedShip = ship;
     this.sendShip(this.selectedShip);
   }
 }