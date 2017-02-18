import { Subject } from 'rxjs';

export class KeyEmitter extends Subject<string>{
  constructor() { 
    super(); 
  }
  
  emit(data) {
    super.next(data);
  }
}