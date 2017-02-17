import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { GridComponent } from '../grid/grid.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { Message } from '../../models/message';
import { MessageService } from '../../services/message.service';
@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {
  shotCount: number;  
  stats: Array<Object>;
  myMessage: Message;
  
  constructor(private messageService: MessageService){}

  ngOnInit(): void {
    //this.myMessage.message = 'Herro';
  }
  onKey(event: any){
    console.log("Key pressed: ", event.key.replace("Arrow", ""));    
  }
}
