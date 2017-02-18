import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SocketService } from '../services/socket.service';
import { KeyEmitter } from '../helpers/KeyEmitter';
import { ShipEmitter } from '../helpers/ShipEmitter';
import { Ship } from '../models';

@Injectable()
 export class GameService{
   ShipStream: ShipEmitter;
   KeyStream: KeyEmitter;
   selectedShip: Ship;
   listener:any;

   constructor(private socketService: SocketService) {
    this.ShipStream = new ShipEmitter();
    this.KeyStream = new KeyEmitter();
    this.selectedShip = new Ship();    
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