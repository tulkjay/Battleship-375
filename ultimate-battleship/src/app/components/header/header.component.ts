import { Component} from '@angular/core';

@Component({
  selector: 'header', 
  template: `
    <h1 align="center">
      {{title}}
    </h1>
  `, 
  styleUrls: ['./header.component.css']
})

export class HeaderComponent {
  title: string;

  constructor(){
    this.title = "Ultimate Battleship"
  }
}