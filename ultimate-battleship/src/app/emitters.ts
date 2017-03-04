import { Subject } from 'rxjs';
import { Message, Ship } from './models';

export class KeyEmitter extends Subject<string> {
  constructor() { 
    super(); 
  }
  
  emit(data) {
    super.next(data);
  }
}

export class MessageEmitter extends Subject<Message> {
  constructor() { 
    super(); 
  }
  
  emit(data) {
    super.next(data);
  }
}

export class ShipEmitter extends Subject<Ship> {
  constructor() { 
    super(); 
  }
  
  emit(data) {
    super.next(data);
  }
}

export class GameStateEmitter extends Subject<string> {
  constructor() { 
    super(); 
  }
  
  emit(data) {
    super.next(data);
  }
}

export class StateEmitter extends Subject<Array<any>> {
  constructor() {
    super();
  }

  emit(...data){
    super.next(data);
  }
}