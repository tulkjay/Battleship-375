import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { SocketService } from '../../services/socket.service';
import { ShipCatalog } from '../../helpers/ShipCatalog';

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

  constructor(private gameService: GameService, private socketService : SocketService) {
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
    console.log("state: ", success[0])
    this.shotsFired++;
    
    if(success[0]) {
      this.shotsHit++;
    } else {
      this.shotsMissed++;
    }
    this.hitMissRatio = this.shotsHit/this.shotsFired;
  }
}
