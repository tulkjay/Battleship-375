import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { SocketService } from '../../services/socket.service';
import { MessageService } from '../../services/message.service';
import { ShipCatalog } from '../../helpers/ShipCatalog';
import { Message } from '../../models';

@Component({
  selector:'scoreboard', 
  templateUrl: './scoreboard.component.html', 
  styleUrls: ['./scoreboard.component.css']
})

export class ScoreboardComponent {
  state: any;  
  shotsFired: number;
  shotsHit: number;
  shotsMissed: number;
  hitMissRatio: number;
  listener: any;
  stateMessage: string;
  selectedShip: string;

  constructor(private gameService: GameService, private socketService : SocketService, private messageService: MessageService) {
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.shotsMissed = 0;
    this.hitMissRatio = this.shotsFired > 0 ? this.shotsHit/this.shotsFired : 0;    

    this.gameService.GameStateStream.subscribe(state => this.setGameState(state));
    this.gameService.StateStream.subscribe(state => this.updateStats(state));        
  }

  getStateBackgroundColor() {
    switch(this.state) {
      case 'setup':
        this.stateMessage = "Place your ships";
        return 'yellow'
      case 'in-progress':
        this.stateMessage = this.socketService.isPlayerTurn ? 'Fire when ready' : 'Waiting for return fire';
        return this.socketService.isPlayerTurn ? 'green' : 'red'
      case 'waiting':
        this.stateMessage = "Waiting for opponent";
        return 'red'
      case 'done':
       this.stateMessage = this.socketService.won ? 'You won!' : 'You lost'
        return this.socketService.won ? 'green' : 'red'
      default:
        return 'lightgray'
    }
  }  

  setGameState(newState: Object) {
    console.log("state change received: ", newState);    
    this.state = newState;       
  }

  updateStats(success: Object) {    
    this.shotsFired++;
    
    if(success[0]) {
      this.messageService.send(new Message("Shot on target!", 3000));
      this.shotsHit++;
    } else {
      this.messageService.send(new Message("Shot missed", 3000));      
      this.shotsMissed++;
    }
    this.hitMissRatio = this.shotsHit/this.shotsFired;
  }
}
