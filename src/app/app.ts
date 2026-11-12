import { Component } from '@angular/core';
import { ChatComponent } from './chat/chat.component';

@Component({
  imports: [ChatComponent],
  selector: 'app-root',
  template: '<app-chat />',
})
export class App {}
