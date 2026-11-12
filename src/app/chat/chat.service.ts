import { Injectable, inject, signal } from '@angular/core';
import { LlmClient } from '../core/llm/llm-client';
import { BaseMessage } from '@langchain/core/messages';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly llm = inject(LlmClient);

  readonly messages = signal<BaseMessage[]>([]);
  /** Prompt do sistema; lido a cada envio, então pode mudar entre interações. */
  readonly systemPrompt = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async send(query: string): Promise<void> {
    const text = query.trim();
    if (!text || this.loading()) return;

    this.error.set(null);
    this.messages.update((m) => [...m, new HumanMessage(text)]);
    this.loading.set(true);

    try {
      const reply = await this.llm.invoke(this.buildPayload());
      this.messages.update((m) => [...m, reply]);
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      this.loading.set(false);
    }
  }

  private buildPayload(): BaseMessage[] {
    const prompt = this.systemPrompt().trim();
    return prompt ? [new SystemMessage(prompt), ...this.messages()] : this.messages();
  }
}
