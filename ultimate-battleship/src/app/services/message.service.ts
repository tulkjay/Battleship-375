import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MessageEmitter } from '../emitters';
import { Message } from '../models';

@Injectable()
 export class MessageService{
   Stream:MessageEmitter;

   constructor() {
    this.Stream = new MessageEmitter();
   }

   send(message:Message) {
     this.Stream.emit(message);
   }
 }