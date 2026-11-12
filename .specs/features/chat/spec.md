# Chat com Claude

## Problem Statement
O usuário quer digitar uma pergunta e receber a resposta do Claude, mantendo o histórico entre recarregamentos e navegando por múltiplas conversas.

## Assumptions & Open Questions
- A chamada ocorre direto do browser com a API key do usuário (AD-001, AD-002).
- O histórico é persistido em `localStorage` por enquanto (AD-004).

## User Stories
- Como usuário, quero conversar com o Claude e ver o histórico da conversa.
- Como usuário, quero retomar uma conversa pelo id na URL ou pela sidebar.

## Out of Scope
- Streaming, backend proxy, autenticação e sincronização entre dispositivos.

## Requirements
- CHAT-01: WHEN o usuário envia uma query não vazia, THE ChatService SHALL adicionar uma mensagem de role "user" ao histórico.
- CHAT-02: WHEN a query é vazia ou só espaços, THE ChatService SHALL ignorar o envio sem chamar a API.
- CHAT-03: WHEN a API responde com sucesso, THE ChatService SHALL adicionar uma mensagem de role "assistant" com o texto retornado.
- CHAT-04: WHEN a chamada é feita, THE ChatService SHALL enviar o histórico completo ao LlmClient, que usa ChatAnthropic (LangChain) com model claude-haiku-4-5 e maxTokens 1024.
- CHAT-05: IF a API falha, THEN THE ChatService SHALL expor uma mensagem de erro e manter o histórico sem mensagem de assistant.
- CHAT-06: WHILE uma requisição está em andamento, THE ChatService SHALL expor loading verdadeiro.
- CHAT-07: IF a API key está vazia, THEN THE ChatService SHALL bloquear o envio e expor um erro.
- CHAT-08: WHEN há mensagens, THE ChatComponent SHALL exibi-las em ordem com o role identificado.
- CHAT-09: WHEN o app inicia, THE ChatService SHALL carregar as conversas salvas no `localStorage`.
- CHAT-10: WHEN uma conversa ou mensagem é criada, THE ChatService SHALL persistir o estado no `localStorage`.
- CHAT-11: WHEN a URL contém `/chat/:id`, THE ChatComponent SHALL carregar a conversa correspondente.

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
| CHAT-09 | Done |
| CHAT-10 | Done |
| CHAT-11 | Done |
