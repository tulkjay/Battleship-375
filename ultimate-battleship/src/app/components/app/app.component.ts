import { Component , OnInit} from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { MainComponent } from '../main/main.component';
import { MessageComponent } from '../message/message.component';
import * as io from 'socket.io-client';

@Component({
    selector: 'app-root',
    template: `
      <message></message>
      <main></main>
    `, 
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  socket: SocketIOClient.Socket;

  constructor(private socketService: SocketService){}
  
  ngOnInit():void{
    this.socketService.connectPlayer();
  }
}