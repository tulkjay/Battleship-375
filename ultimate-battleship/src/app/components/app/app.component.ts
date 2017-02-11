import { Component , OnInit} from '@angular/core';
import { MainComponent } from '../main/main.component';
import * as io from 'socket.io-client';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html', 
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
    title: string;
    socket: SocketIOClient.Socket;

    ngOnInit(): void {
      this.socket = io('http://localhost:3000');
      this.socket.on('connect', () => {
        this.title = 'Connected! Listening for messages from the server...';
          setTimeout(() => {
            this.title = "Ultimate Battleship";
          }, 3000);
        });
    }
}