/*
This component will display useful information
that is displayed at the top of the screen.
Connection messages, player name, etc...
*/
import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'header', 
  template: `
    <h1 align="center">{{title}}</h1>
  `, 
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
    title: string;
    socket: SocketIOClient.Socket;
    constructor(private socketService: SocketService){
      this.title = "Loading"
    }

    ngOnInit(): void {
      this.socket = this.socketService.getConnection();

      this.socket.emit('add-player', err => {
        if(err) console.log(`Error: ${err}`);
      });

      this.socket.on('connection-result', response => {
        this.title = response.message;
        if(response.isTurn) this.socketService.setTurn(response.isTurn);

        setTimeout(() => {
          this.title = "Ultimate Battleship";
        }, 3000);
      }); 
    }
}