import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { Message } from '../models/message';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService{
  socket: SocketIOClient.Socket;
  isPlayerTurn: boolean;
  
  constructor(private messageService: MessageService){
    this.isPlayerTurn = false;
    this.socket = io('http://localhost:3000');

    this.socket.on('connection-result', response => {        
      if(response.isTurn) this.setTurn(response.isTurn);        
      this.messageService.send(new Message(response.message));        
    });

    this.socket.on('shot-received', response => {        
      this.changeTurn();
      this.messageService.send(new Message(`Shot received at (${response.x},${response.y})`));        
    });
  }

  getConnection(): SocketIOClient.Socket{    
    return this.socket;
  }
  
  changeTurn():void {
    this.isPlayerTurn = !this.isPlayerTurn;
  }

  connectPlayer():void {
    this.socket.emit('add-player', err => {
      if(err) console.log(`Error: ${err}`);
    });
  }

  setTurn(isTurn: boolean):void {
    this.isPlayerTurn = isTurn;
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
}