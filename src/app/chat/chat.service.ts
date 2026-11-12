import { Injectable, computed, inject, signal } from '@angular/core';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { LlmClient } from '../core/llm/llm-client';

const SYSTEM_PROMPT_KEY = 'chat-llm.systemPrompt';
const CHATS_KEY = 'chat-llm.chats.v1';

/** Formato enxuto salvo no localStorage: só o necessário para remontar a conversa. */
interface MensagemSalva {
  type: string;
  text: string;
}

interface ConversaSalva {
  id: string;
  titulo: string;
  messages: MensagemSalva[];
}

/** Lê o prompt salvo. O try/catch protege ambientes sem localStorage (SSR/testes). */
function lerSystemPromptSalvo(): string {
  try {
    return localStorage.getItem(SYSTEM_PROMPT_KEY) ?? '';
  } catch {
    return '';
  }
}

function mensagemSalvaParaBase(mensagem: MensagemSalva): BaseMessage | null {
  if (typeof mensagem?.text !== 'string') return null;
  if (mensagem.type === 'human') return new HumanMessage(mensagem.text);
  if (mensagem.type === 'ai') return new AIMessage(mensagem.text);
  if (mensagem.type === 'system') return new SystemMessage(mensagem.text);
  return null;
}

/**
 * [AULA · Persistência] O JSON do localStorage não guarda classes do LangChain.
 * Por isso salvamos `{ type, text }` e remontamos HumanMessage/AIMessage na leitura.
 */
function lerConversasSalvas(): Conversa[] {
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    if (!raw) return [];

    const dados: unknown = JSON.parse(raw);
    if (!Array.isArray(dados)) return [];

    return dados.flatMap((item: unknown) => {
      if (!item || typeof item !== 'object') return [];

      const conversa = item as Partial<ConversaSalva>;
      if (
        typeof conversa.id !== 'string' ||
        typeof conversa.titulo !== 'string' ||
        !Array.isArray(conversa.messages)
      ) {
        return [];
      }

      const messages = (conversa.messages as MensagemSalva[])
        .map(mensagemSalvaParaBase)
        .filter((m): m is BaseMessage => m !== null);

      return [{ id: conversa.id, titulo: conversa.titulo, messages }];
    });
  } catch {
    return [];
  }
}

/** Uma conversa da sidebar. Persistida em localStorage por enquanto (protótipo). */
export interface Conversa {
  id: string;
  titulo: string;
  messages: BaseMessage[];
}

/*
 * [AULA · Por que o estado fica no SERVIÇO e não no componente?]
 * O Angular DESTRÓI o ChatComponent ao navegar para /configuracoes e cria outro ao voltar.
 * Tudo que estivesse no componente se perderia. Um serviço `providedIn: 'root'` é singleton
 * e vive enquanto a aplicação viver. Além disso, persistimos as conversas em localStorage
 * para que a sidebar e o histórico sobrevivam a um reload/acesso direto pela URL.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly llm = inject(LlmClient);

  // Todas as conversas (a sidebar lista isto). Já começam carregadas do localStorage.
  readonly chats = signal<Conversa[]>(lerConversasSalvas());
  // Qual conversa está aberta; null = tela de "Nova conversa" (ainda não existe no array).
  readonly activeChatId = signal<string | null>(null);

  // [Signals · computed] Valores DERIVADOS: recalculam sozinhos quando chats ou
  // activeChatId mudam. Nunca duplicamos o dado (guardar "mensagens ativas" separado
  // criaria risco de ficar fora de sincronia).
  readonly activeChat = computed(() => this.chats().find((c) => c.id === this.activeChatId()));
  readonly activeMessages = computed(() => this.activeChat()?.messages ?? []);

  /**
   * Prompt do sistema; lido a cada envio, então pode mudar entre interações.
   * Persistido em localStorage para sobreviver a um reload da página.
   */
  readonly systemPrompt = signal(lerSystemPromptSalvo());
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Trecho do prompt exibido no cabeçalho do chat para confirmar o que está ativo. */
  readonly systemPromptPreview = computed(() => {
    const prompt = this.systemPrompt().trim();
    return prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt;
  });

  salvarSystemPrompt(texto: string): void {
    this.systemPrompt.set(texto);
    try {
      localStorage.setItem(SYSTEM_PROMPT_KEY, texto);
    } catch {
      // Sem localStorage, o prompt continua valendo só em memória.
    }
  }

  /**
   * [AULA · Elo entre ROTA e ESTADO] É chamado pelo ChatComponent sempre que o :id da URL muda.
   * A URL manda: ela é a fonte da verdade de "qual conversa está aberta".
   * Id inexistente (ex.: link antigo) cai em "conversa nova".
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
    const titulo =
      primeiraPergunta.length > 30 ? primeiraPergunta.slice(0, 30) + '…' : primeiraPergunta;
    this.chats.update((l) => [...l, { id, titulo, messages: [] }]);
    this.persistirConversas();
    this.activeChatId.set(id);
    return id;
  }

  // [Signals · imutabilidade] update() devolve um array/objeto NOVO (spread/map) em vez
  // de dar push. Signals detectam mudança por referência: mutar no lugar não notificaria.
  private addMessage(id: string, msg: BaseMessage): void {
    this.chats.update((l) =>
      l.map((c) => (c.id === id ? { ...c, messages: [...c.messages, msg] } : c)),
    );
    this.persistirConversas();
  }

  private persistirConversas(): void {
    try {
      const dados: ConversaSalva[] = this.chats().map((c) => ({
        id: c.id,
        titulo: c.titulo,
        messages: c.messages.map((m) => ({ type: m.type, text: m.text })),
      }));
      localStorage.setItem(CHATS_KEY, JSON.stringify(dados));
    } catch {
      // Sem localStorage (ou cota cheia), as conversas continuam só em memória.
    }
  }

  private buildPayload(id: string): BaseMessage[] {
    const messages = this.chats().find((c) => c.id === id)?.messages ?? [];
    const prompt = this.systemPrompt().trim();
    return prompt ? [new SystemMessage(prompt), ...messages] : messages;
  }
}
