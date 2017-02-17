import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { GridComponent } from '../grid/grid.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent {

  onKey(event: any){
    console.log("Key pressed: ", event.key.replace("Arrow", ""));    
  }
}
