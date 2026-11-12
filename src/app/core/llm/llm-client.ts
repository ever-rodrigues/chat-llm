import { AIMessage, BaseMessage } from '@langchain/core/messages';

/** Contrato genérico de um provedor de LLM. O chat depende só disto. */
export abstract class LlmClient {
  abstract invoke(messages: readonly BaseMessage[]): Promise<AIMessage>;
}
