import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChatService } from '../chat/chat.service';

@Component({
  // [AULA · Componente de layout] A sidebar tem um dono só: ela cuida da navegação
  // entre conversas. O AppComponent fica apenas com a casca (layout + router-outlet).
  // Continua standalone: importa SÓ as diretivas de rota que usa no template.
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  // [AULA · Signals] O ChatService é `providedIn: 'root'`: AppComponent, Sidebar e
  // ChatComponent compartilham A MESMA instância. Por isso a sidebar lê chats()
  // direto e se atualiza sozinha quando uma conversa é criada — sem @Input e sem
  // subscribe manual. Se ela recebesse a lista por @Input, o App voltaria a
  // conhecer o domínio de chat só para repassar dados.
  protected readonly chat = inject(ChatService);
}
