import { Subject } from 'rxjs';
import { Message } from '../models/message';

export class MessageEmitter extends Subject<Message>{
  constructor() { 
    super(); 
  }
  
  emit(data) {
    super.next(data);
  }
}