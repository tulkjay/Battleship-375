import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { GameService } from './game.service';
import { Message } from '../models';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService{
  socket: SocketIOClient.Socket;
  isPlayerTurn: boolean;
  
  constructor(private messageService: MessageService, private gameService: GameService){
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

    this.socket.on('state-changed', state => {
      this.gameService.setGameState(state);
    })
  }

  emit(callName:string, ...args:Array<any>) {
    this.socket.emit(callName, args);
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