import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { ShipBuilder } from '../../helpers/ShipBuilder';

@Component({
  selector:'scoreboard', 
  templateUrl: './scoreboard.component.html', 
  styleUrls: ['./scoreboard.component.css']
})

export class ScoreboardComponent {
  shotsFired: number;
  shotsHit: number;
  shipsSunk: number;
  shipsLost: number;
  hitMissRatio: number;
  listener: any;
  shipBuilder: ShipBuilder;  
  constructor(private gameService: GameService) {
    this.shotsFired = 14;
    this.shotsHit = 6;
    this.shipsSunk = 2;
    this.shipsLost = 0;
    this.hitMissRatio = this.shotsHit/this.shotsFired;    
    this.shipBuilder = new ShipBuilder();
    this.gameService.StateStream.subscribe(state => this.setState(state));
  }

  setState(state:Array<any>) {
    console.log("state change received: ", state);    
  }
  
  dragShip(event:any, shipName:string):void {
    let data = this.shipBuilder.build(shipName);
    event.dataTransfer.setData('ship', JSON.stringify(this.shipBuilder.build(shipName)));
  }
  
  setShip(shipName:string) {
    this.gameService.setSelectedShip(this.shipBuilder.build(shipName))
  }
}
