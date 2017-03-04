import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { ShipBuilder } from '../../helpers/ShipBuilder';

@Component({
  selector:'scoreboard', 
  templateUrl: './scoreboard.component.html', 
  styleUrls: ['./scoreboard.component.css']
})

export class ScoreboardComponent {
  state: any;  
  shotsFired: number;
  shotsHit: number;
  shipsSunk: number;
  shipsLost: number;
  hitMissRatio: number;
  listener: any;
  shipBuilder: ShipBuilder;  

  constructor(private gameService: GameService) {
    this.state = {
      shotsFired: 0,
      shotsHit: 0,
      shipsSunk: 0,
      shipsLost: 0,
      hitMissRatio: this.shotsFired > 0 ? this.shotsHit/this.shotsFired : 0
    };

    this.shotsFired = 0;
    this.shotsHit = 0;
    this.shipsSunk = 0;
    this.shipsLost = 0;
    this.hitMissRatio = this.shotsFired > 0 ? this.shotsHit/this.shotsFired : 0;    
    this.shipBuilder = new ShipBuilder();

    this.gameService.StateStream.subscribe(state => this.setState(state));
  }

  setState(newState: Object) {
    console.log("state change received: ", newState);    
    
    for(var item in newState){
      this.state[item] = newState[item]
    }
  }
  
  dragShip(event:any, shipName:string):void {
    let data = this.shipBuilder.build(shipName);
    event.dataTransfer.setData('ship', JSON.stringify(this.shipBuilder.build(shipName)));
  }
  
  setShip(shipName:string) {
    this.gameService.setSelectedShip(this.shipBuilder.build(shipName))
  }
}
