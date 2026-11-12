import { Injectable } from '@angular/core';
import { ChatAnthropic } from '@langchain/anthropic';
import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { LlmClient } from '../../core/llm/llm-client';
import { ANTHROPIC_API_KEY } from './api-key';
import { ANTHROPIC_MAX_TOKENS, ANTHROPIC_MODEL } from './anthropic.config';

@Injectable()
export class AnthropicClient extends LlmClient {
  private model?: ChatAnthropic;

  async invoke(messages: readonly BaseMessage[]): Promise<AIMessage> {
    if (!ANTHROPIC_API_KEY.trim()) {
      throw new Error('Informe a API key da Anthropic.');
    }
    this.model ??= new ChatAnthropic({
      model: ANTHROPIC_MODEL,
      maxTokens: ANTHROPIC_MAX_TOKENS,
      apiKey: ANTHROPIC_API_KEY,
      // Necessário para chamar a API direto do navegador (apenas para aula).
      clientOptions: { dangerouslyAllowBrowser: true },
    });
    try {
      return await this.model.invoke([...messages]);
    } catch (e: unknown) {
      throw new Error(e instanceof Error && e.message ? e.message : 'Falha ao chamar a API do Claude.');
    }
  }
}
