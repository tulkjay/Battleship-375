import { Component, OnInit } from '@angular/core';
import { GridComponent } from '../grid/grid.component';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {
  shotCount: number;  
  stats: Array<Object>;

  ngOnInit(): void {}

  onKey(event: any){
    console.log("Key pressed: ", event.target.value);
  }

}
