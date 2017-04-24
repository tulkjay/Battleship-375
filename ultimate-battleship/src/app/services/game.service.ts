import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ShipEmitter, KeyEmitter, GameStateEmitter, StateEmitter } from '../emitters';
import { Ship } from '../models';

@Injectable()
 export class GameService {
   ShipStream: ShipEmitter;
   KeyStream: KeyEmitter;
   StateStream: StateEmitter;
   GameStateStream: GameStateEmitter;
   selectedShip: Ship;
   listener:any;
   gameState:string;

   constructor() {
    this.ShipStream = new ShipEmitter();
    this.KeyStream = new KeyEmitter();
    this.StateStream = new StateEmitter();
    this.GameStateStream = new GameStateEmitter();
    this.selectedShip = new Ship();    
    this.gameState = 'waiting';        
   }
   
   setGameState(gameState: string) {
    if(this.gameState !== gameState) {
      this.gameState = gameState;
      console.log("The game's state has been set to: ", this.gameState);
      this.GameStateStream.emit(this.gameState)      
    }    
   }

   updateState(state: Array<any>) {
     console.log("The state is now: ", state);
     this.StateStream.emit(state);
   }

   getGameState():string {
    return this.gameState;
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