import { Injectable } from '@angular/core';
import { Message } from '../models/message';
import { MessageEmitter } from '../helpers/MessageEmitter';
import { Subject } from 'rxjs';

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