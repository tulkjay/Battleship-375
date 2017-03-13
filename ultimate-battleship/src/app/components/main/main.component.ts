import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { SocketService } from '../../services/socket.service';
import { HeaderComponent } from '../header/header.component';
import { GridComponent } from '../grid/grid.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent {

  constructor(private gameService: GameService, private socketService: SocketService){}

  onKey(event: any){
    this.gameService.sendKeyStroke(event.key.replace("Arrow", ""));
  }
}
