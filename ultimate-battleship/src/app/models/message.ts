/*
  Message is given its own class so that it can be expanded on, 
  potentially to control the way the message is displayed, with a 
  settable string that gets assigned to the message's css
*/
export class Message{
  message: string;
  active: boolean;

  constructor(text: string){
    this.message = text;
    this.active = true;
  }
}