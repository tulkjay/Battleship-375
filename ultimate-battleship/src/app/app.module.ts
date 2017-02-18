import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './components/app/app.component';
import { GridComponent } from './components/grid/grid.component';
import { MainComponent } from './components/main/main.component';
import { HeaderComponent } from './components/header/header.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { MessageComponent } from './components/message/message.component';
import { SocketService } from './services/socket.service';
import { MessageService } from './services/message.service';
import { GameService } from './services/game.service';

@NgModule({
  declarations: [
    AppComponent, 
    MainComponent, 
    HeaderComponent,
    GridComponent, 
    ScoreboardComponent, 
    MessageComponent, 
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    SocketService, 
    MessageService,
    GameService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
