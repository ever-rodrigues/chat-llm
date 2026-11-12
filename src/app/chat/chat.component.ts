import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  protected readonly chat = inject(ChatService);
  // [Conceito 5] ActivatedRoute = "a rota que gerou ESTE componente": dá acesso aos
  // parâmetros da URL.
  private readonly route = inject(ActivatedRoute);
  // Router = navegação por CÓDIGO (o routerLink é a navegação pelo TEMPLATE).
  private readonly router = inject(Router);

  protected readonly query = signal('');
  protected readonly visibleMessages = computed(() =>
    this.chat.activeMessages().filter((m) => m.type !== 'system'),
  );

  constructor() {
    // [Conceito 5 — params.subscribe] É um Observable: emite agora e a cada mudança de :id.
    // Por que não só snapshot? Ao ir de /chat/1 para /chat/2 o Angular REAPROVEITA a mesma
    // instância do componente (o construtor não roda de novo), então o snapshot ficaria velho.
    // Não precisa de unsubscribe: o Router destrói o ActivatedRoute junto com o componente.
    this.route.params.subscribe((params) => this.chat.carregarConversaPorId(params['id'] ?? null));
  }

  /**
   * [Conceito 6 — flag derivada do parâmetro] snapshot = "foto" dos parâmetros neste instante.
   * Presença do :id -> conversa existente; ausência -> conversa nova. O template usa para
   * trocar o título (mesma ideia de "Novo Cantor" x "Editar Cantor").
   */
  protected get emConversa(): boolean {
    return !!this.route.snapshot.params['id'];
  }

  protected async submit(): Promise<void> {
    const q = this.query();
    this.query.set('');
    const id = await this.chat.send(q);
    // Navegação por código: a conversa acabou de ser criada na rota /chat (sem id),
    // então levamos o usuário para /chat/<id>. Assim a URL passa a identificar a conversa
    // (o link é compartilhável dentro da sessão e a sidebar marca o item como ativo).
    if (id && !this.emConversa) this.router.navigate(['/chat', id]);
  }
}
