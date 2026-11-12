# Angular LLM Chat (LangChain + Anthropic)

Chat em Angular 22 que conversa com o Claude (Anthropic) usando o framework **LangChain**.
Projeto de aula: a chamada ao LLM é feita direto do navegador.

## Pacotes necessários

| Pacote | Para que serve |
| --- | --- |
| `@langchain/core` | Tipos base: `HumanMessage`, `AIMessage`, `SystemMessage`, `BaseMessage` |
| `@langchain/anthropic` | `ChatAnthropic`, o provedor Claude para o LangChain |

## Passo a passo do desenvolvimento

### 1. Instalar dependências

```bash
npm install @langchain/core @langchain/anthropic
```

### 2. Configurar a chave da Anthropic

Edite `src/app/infra/anthropic/api-key.ts` e exporte `ANTHROPIC_API_KEY`.
Modelo e limite de tokens ficam em `src/app/infra/anthropic/anthropic.config.ts`.
**Nunca commite a chave real** (use uma chave descartável; ela fica exposta no bundle do navegador).

### 3. Mensagens: trocar modelos próprios pelos do LangChain

Removemos `src/app/core/models/*` e passamos a usar
`import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages'`.
O texto da mensagem é lido por `message.text` e o papel por `message.type` (`human` | `ai` | `system`).

### 4. Contrato do LLM (`core/llm/llm-client.ts`)

```ts
export abstract class LlmClient {
  abstract invoke(messages: readonly BaseMessage[]): Promise<AIMessage>;
}
```

O chat depende só desta abstração, então o provedor pode ser trocado sem mexer na UI.

### 5. Provedor Anthropic via LangChain (`infra/anthropic/anthropic-client.ts`)

Substitui o `HttpClient` + cabeçalhos manuais por `ChatAnthropic`:

```ts
this.model ??= new ChatAnthropic({
  model: ANTHROPIC_MODEL,
  maxTokens: ANTHROPIC_MAX_TOKENS,
  apiKey: ANTHROPIC_API_KEY,
  clientOptions: { dangerouslyAllowBrowser: true }, // chamada direta do navegador
});
return this.model.invoke([...messages]);
```

O LangChain converte `SystemMessage`/`HumanMessage`/`AIMessage` para o formato da API automaticamente.

### 6. Injeção de dependência (`app.config.ts`)

`provideHttpClient()` não é mais necessário. Fica:

```ts
providers: [
  provideBrowserGlobalErrorListeners(),
  { provide: LlmClient, useClass: AnthropicClient },
]
```

### 7. ChatService e componente

- `ChatService` mantém `chats`, `activeChatId`, `loading` e `error` como signals e envia o histórico completo a cada chamada.
- As conversas e mensagens são persistidas em `localStorage` (`chat-llm.chats.v1`) e recarregadas ao iniciar.
- O template exibe `m.text` (e não mais `m.content`, que pode ser um array de blocos).

### 8. Ajustes de build (`angular.json`)

O SDK da Anthropic faz `import('node:fs')` / `import('node:path')` em código só usado no Node.
Para o esbuild do Angular não falhar:

```json
"externalDependencies": ["node:fs", "node:path"]
```

Além disso, o limite de bundle inicial (`budgets`) subiu de 1MB para 2MB de erro, pois o LangChain aumenta o bundle.

### 9. Rotas e múltiplas conversas

A aplicação evoluiu de tela única para uma SPA com sidebar:

| Rota | Componente | Uso |
| --- | --- | --- |
| `/chat` | `ChatComponent` | Nova conversa |
| `/chat/:id` | `ChatComponent` | Conversa existente |
| `/configuracoes` | `SystemPromptComponent` | Edição do Prompt de Sistema |

- `app.routes.ts` define a tabela e `app.config.ts` registra `provideRouter(routes)`.
- `app.html` tem a sidebar (`routerLink` / `routerLinkActive`) e o `<router-outlet>`.
- `ChatService` guarda todas as conversas em Signals e sobrevive à navegação.
- Conversas, mensagens e Prompt de Sistema são persistidos em `localStorage`.
- Ao abrir `/chat` direto, a sidebar já vem preenchida com o histórico salvo.
- O Prompt de Sistema aparece no cabeçalho do chat.
- `ChatComponent` lê o `:id` com `ActivatedRoute.params.subscribe()`.

O roteiro completo da aula, os testes manuais e o quiz estão em
[`GUIA-AULA.md`](./GUIA-AULA.md).

### 10. Build

```bash
npm run build
```

## Executar

```bash
npm install
npm start      # http://localhost:4200
```

## Estrutura

```
src/app/
  app.routes.ts                     # tabela de rotas
  app.ts / app.html / app.scss      # casca + sidebar + router-outlet
  core/llm/llm-client.ts            # contrato do LLM
  infra/anthropic/                  # ChatAnthropic + config + chave
  chat/
    chat.service.ts                 # múltiplas conversas em Signals
    chat.component.*                # conversa ativa (/chat e /chat/:id)
    system-prompt/                  # página /configuracoes
  app.config.ts                     # DI + provideRouter
```
