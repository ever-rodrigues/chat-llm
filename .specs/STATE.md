# STATE

## Decisions
- AD-001: Chamada direta do browser à API Anthropic via HttpClient, sem SDK. Uso local apenas.
- AD-002: API key digitada na tela, mantida só em memória (nunca persistida).
- AD-003: Resposta completa (sem streaming); modelo padrão claude-haiku-4-5; max_tokens 1024.
- AD-004: Histórico só em memória (signal no ChatService).

## Handoff
Feature chat em implementação.
