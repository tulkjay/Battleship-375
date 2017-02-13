import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {
  socket: SocketIOClient.Socket;
  constructor(){
    console.log("Creating game service")
    this.socket = io('http://localhost:3000');
  }
    getConnection(): SocketIOClient.Socket{
       return this.socket;
    }
    fire(x, y):boolean {
      return false;
    }
    login(login):string {
      return 'Player Name Here'
    }
    sendStatus(playerName): void {

    }
}