# Chat com Claude

## Problem Statement
O usuário quer digitar uma pergunta e receber a resposta do Claude, mantendo o histórico em memória.

## Assumptions & Open Questions
- A chamada ocorre direto do browser com a API key do usuário (AD-001, AD-002).
- O histórico some ao recarregar a página (AD-004).

## User Stories
- Como usuário, quero conversar com o Claude e ver o histórico da conversa.

## Out of Scope
- Persistência, streaming, backend proxy, múltiplas conversas.

## Requirements
- CHAT-01: WHEN o usuário envia uma query não vazia, THE ChatService SHALL adicionar uma mensagem de role "user" ao histórico.
- CHAT-02: WHEN a query é vazia ou só espaços, THE ChatService SHALL ignorar o envio sem chamar a API.
- CHAT-03: WHEN a API responde com sucesso, THE ChatService SHALL adicionar uma mensagem de role "assistant" com o texto retornado.
- CHAT-04: WHEN a chamada é feita, THE ChatService SHALL enviar POST para https://api.anthropic.com/v1/messages com os headers x-api-key, anthropic-version e anthropic-dangerous-direct-browser-access, model claude-haiku-4-5, max_tokens 1024 e o histórico completo em messages.
- CHAT-05: IF a API falha, THEN THE ChatService SHALL expor uma mensagem de erro e manter o histórico sem mensagem de assistant.
- CHAT-06: WHILE uma requisição está em andamento, THE ChatService SHALL expor loading verdadeiro.
- CHAT-07: IF a API key está vazia, THEN THE ChatService SHALL bloquear o envio e expor um erro.
- CHAT-08: WHEN há mensagens, THE ChatComponent SHALL exibi-las em ordem com o role identificado.

## Requirement Traceability
| ID | Status |
|----|--------|
| CHAT-01 | Done |
| CHAT-02 | Done |
| CHAT-03 | Done |
| CHAT-04 | Done |
| CHAT-05 | Done |
| CHAT-06 | Done |
| CHAT-07 | Done |
| CHAT-08 | Done |
