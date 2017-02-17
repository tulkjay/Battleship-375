import { Component } from '@angular/core';

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

  constructor() {
    this.shotsFired = 14;
    this.shotsHit = 6;
    this.shipsSunk = 2;
    this.shipsLost = 0;
    this.hitMissRatio = this.shotsHit/this.shotsFired;
  }
}
