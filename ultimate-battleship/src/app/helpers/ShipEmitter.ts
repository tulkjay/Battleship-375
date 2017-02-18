import { Subject } from 'rxjs';
import { Ship } from '../models';

export class ShipEmitter extends Subject<Ship>{
  constructor() { 
    super(); 
  }
  
  emit(data) {
    super.next(data);
  }
}