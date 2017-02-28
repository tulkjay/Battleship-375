import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ShipEmitter, KeyEmitter, StateEmitter } from '../emitters';
import { Ship } from '../models';

@Injectable()
 export class GameService {
   ShipStream: ShipEmitter;
   KeyStream: KeyEmitter;
   StateStream: StateEmitter;
   selectedShip: Ship;
   listener:any;
   state:string;

   constructor() {
    this.ShipStream = new ShipEmitter();
    this.KeyStream = new KeyEmitter();
    this.StateStream = new StateEmitter();
    this.selectedShip = new Ship();    
    this.state = 'waiting';        
   }
   
   setGameState(state:string) {
    if(this.state !== state) {
      this.state = state;
      console.log("The game's state has been set to: ", this.state);
      this.StateStream.emit(this.state)
    }    
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