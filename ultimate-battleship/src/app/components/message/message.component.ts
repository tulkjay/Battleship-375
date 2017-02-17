import { Component, OnInit} from '@angular/core';
import { MessageService } from '../../services/message.service';
import { Message } from '../../models/message';

@Component({
  selector:'message', 
  template: `
    <div [ngClass]="this.message.active ? 'active' : 'hidden'">
      {{message.message}}
    </div>
  `, 
  styleUrls: ['./message.component.css']
})

export class MessageComponent implements OnInit{  
  message: Message;
  listener = null;

  constructor(private messageService: MessageService){      
    this.message = new Message('');  
  }

  ngOnInit() {
    this.listener = this.messageService.Stream.subscribe(message => this.show(message))
  }

  show(text: Message) {
    this.message = text;
    this.message.active = true;

    setTimeout(() => {
      this.message.active = false;
    }, 1000);
  }
}