import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChatService } from './chat/chat.service';

@Component({
  // [AULA] Em standalone, cada diretiva usada no template precisa estar em `imports`.
  // Sem RouterOutlet/RouterLink/RouterLinkActive aqui, o template não reconhece <router-outlet> nem routerLink.
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // [AULA · Signals] A sidebar lê chat.chats() direto: quando o ChatService cria uma conversa,
  // o signal muda e o menu se atualiza sozinho, sem subscribe nem detecção manual.
  protected readonly chat = inject(ChatService);
}
