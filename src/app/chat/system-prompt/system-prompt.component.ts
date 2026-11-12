import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';

/*
 * [AULA · Componente de ROTA x componente aninhado]
 * Antes este componente ficava dentro do chat (<app-system-prompt />). Agora é uma PÁGINA:
 * quem o renderiza é o router-outlet, via a rota 'configuracoes'. Não aparece em nenhum template.
 */
@Component({
  selector: 'app-system-prompt',
  imports: [FormsModule],
  templateUrl: './system-prompt.component.html',
  styleUrl: './system-prompt.component.scss',
})
export class SystemPromptComponent {
  private readonly chat = inject(ChatService);
  private readonly router = inject(Router);

  // Cópia local do prompt: o usuário edita à vontade e só vale no serviço se clicar em Salvar.
  // Editar direto o signal do serviço aplicaria cada tecla, sem opção de cancelar.
  protected texto = this.chat.systemPrompt();

  protected salvar(): void {
    this.chat.salvarSystemPrompt(this.texto);
    // Depois de salvar, volta ao chat — navegação por código, pois é consequência de uma ação
    // (clique + lógica), não de um simples link. Se havia uma conversa aberta, voltamos para ela.
    const id = this.chat.activeChatId();
    this.router.navigate(id ? ['/chat', id] : ['/chat']);
  }

  protected cancelar(): void {
    // Navegação por código sem alterar o serviço: a edição local é descartada.
    const id = this.chat.activeChatId();
    this.router.navigate(id ? ['/chat', id] : ['/chat']);
  }
}
