import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector:'helpboard', 
  templateUrl: './helpboard.component.html', 
  styleUrls: ['./helpboard.component.css']
})

export class HelpboardComponent {
  state: any;

  constructor(private gameService: GameService) {
    this.gameService.StateStream.subscribe(state => this.setState(state));
  }

  setState(newState: Object) {
    console.log("state change received: ", newState);    
    
    for(var item in newState){
      this.state[item] = newState[item]
    }
  }
}
