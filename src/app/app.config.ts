import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LlmClient } from './core/llm/llm-client';
import { AnthropicClient } from './infra/anthropic/anthropic-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // [AULA · Conceito 2] Equivalente ao RouterModule.forRoot(routes) dos NgModules:
    // registra o roteador e a tabela de rotas na injeção de dependências da aplicação.
    provideRouter(routes),
    { provide: LlmClient, useClass: AnthropicClient },
  ],
};
