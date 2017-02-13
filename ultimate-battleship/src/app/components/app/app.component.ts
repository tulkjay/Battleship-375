import { Component , OnInit} from '@angular/core';
import { MainComponent } from '../main/main.component';
import { SocketService } from '../../services/socket.service';
import * as io from 'socket.io-client';

@Component({
    selector: 'app-root',
    template: `
      <main></main>
    `, 
    styleUrls: ['./app.component.css']
})

export class AppComponent{
  //This component will handle 'logging in' and routing.
}