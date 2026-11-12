import { Injectable, computed, inject, signal } from '@angular/core';
import { LlmClient } from '../core/llm/llm-client';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';

export interface Conversa {
  id: string;
  titulo: string;
  messages: BaseMessage[];
}

/*
 * [AULA · Por que o estado fica no SERVIÇO e não no componente?]
 * O Angular DESTRÓI o ChatComponent ao navegar para /configuracoes e cria outro ao voltar.
 * Tudo que estivesse no componente se perderia. Um serviço `providedIn: 'root'` é singleton
 * e vive enquanto a aplicação viver, então as conversas sobrevivem à navegação.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly llm = inject(LlmClient);

  // Todas as conversas (a sidebar lista isto).
  readonly chats = signal<Conversa[]>([]);
  // Qual conversa está aberta; null = tela de "Nova conversa" (ainda não existe no array).
  readonly activeChatId = signal<string | null>(null);

  // [Signals · computed] Valores DERIVADOS: recalculam sozinhos quando chats ou activeChatId mudam.
  // Nunca duplicamos o dado (guardar "mensagens ativas" separado criaria risco de ficar fora de sincronia).
  readonly activeChat = computed(() => this.chats().find((c) => c.id === this.activeChatId()));
  readonly activeMessages = computed(() => this.activeChat()?.messages ?? []);

  /** Prompt do sistema; lido a cada envio, então pode mudar entre interações. */
  readonly systemPrompt = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * [AULA · Elo entre ROTA e ESTADO] É chamado pelo ChatComponent sempre que o :id da URL muda.
   * A URL manda: ela é a fonte da verdade de "qual conversa está aberta".
   * Id inexistente (ex.: link antigo após recarregar a página) cai em "conversa nova".
   */
  carregarConversaPorId(id: string | null): void {
    this.activeChatId.set(id && this.chats().some((c) => c.id === id) ? id : null);
    this.error.set(null);
  }

  /** Envia a pergunta e devolve o id da conversa usada (criada aqui se ainda não existia). */
  async send(query: string): Promise<string | null> {
    const text = query.trim();
    if (!text || this.loading()) return null;

    const id = this.activeChatId() ?? this.criarConversa(text);
    this.error.set(null);
    this.addMessage(id, new HumanMessage(text));
    this.loading.set(true);

    try {
      // Usamos `id` capturado (e não activeChatId()) de propósito: se o usuário trocar de
      // conversa enquanto a IA responde, a resposta ainda vai para a conversa certa.
      const reply = await this.llm.invoke(this.buildPayload(id));
      this.addMessage(id, reply);
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      this.loading.set(false);
    }
    return id;
  }

  private criarConversa(primeiraPergunta: string): string {
    const id = crypto.randomUUID();
    const titulo = primeiraPergunta.length > 30 ? primeiraPergunta.slice(0, 30) + '…' : primeiraPergunta;
    this.chats.update((l) => [...l, { id, titulo, messages: [] }]);
    this.activeChatId.set(id);
    return id;
  }

  // [Signals · imutabilidade] update() devolve um array/objeto NOVO (spread/map) em vez de dar push.
  // Signals detectam mudança por referência: mutar o array no lugar não notificaria ninguém.
  private addMessage(id: string, msg: BaseMessage): void {
    this.chats.update((l) => l.map((c) => (c.id === id ? { ...c, messages: [...c.messages, msg] } : c)));
  }

  private buildPayload(id: string): BaseMessage[] {
    const messages = this.chats().find((c) => c.id === id)?.messages ?? [];
    const prompt = this.systemPrompt().trim();
    return prompt ? [new SystemMessage(prompt), ...messages] : messages;
  }
}
