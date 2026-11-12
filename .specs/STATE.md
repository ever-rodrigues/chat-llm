# STATE

## Decisions
- AD-001: Chamada direta do browser à API Anthropic via ChatAnthropic (LangChain). Uso local apenas.
- AD-002: API key em `infra/anthropic/api-key.ts`; usar chave descartável e nunca commitar a real.
- AD-003: Resposta completa (sem streaming); modelo padrão claude-haiku-4-5; max_tokens 1024.
- AD-004: Conversas, mensagens e Prompt de Sistema persistidos em `localStorage` (protótipo).

## Handoff
Feature chat em implementação.
