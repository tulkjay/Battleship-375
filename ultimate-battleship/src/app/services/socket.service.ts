import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {
  socket: SocketIOClient.Socket;
  isPlayerTurn: boolean;
  
  constructor(){
    this.isPlayerTurn = false;
    this.socket = io('http://localhost:3000');
  }
  
  getConnection(): SocketIOClient.Socket{
      return this.socket;
  }
  
  setTurn(isTurn: boolean):void {
    this.isPlayerTurn = isTurn;
  }

  changeTurn():void {
    this.isPlayerTurn = !this.isPlayerTurn;
  }

  isTurn():boolean {
    return this.isPlayerTurn;
  }

  fire(x, y):boolean {
    return false;
  }
  
  login(login):string {
    return 'Player Name Here'
  }
  sendStatus(playerName): void {}
}