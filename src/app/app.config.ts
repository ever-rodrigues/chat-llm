import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { LlmClient } from './core/llm/llm-client';
import { AnthropicClient } from './infra/anthropic/anthropic-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LlmClient, useClass: AnthropicClient },
  ],
};
