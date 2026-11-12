# Guia de Aula — Rotas e Múltiplas Conversas

Material de apoio para implementar a evolução do Chat com IA em **1 hora de aula**.
O código final já está no projeto; este guia serve de roteiro de explicação e de testes.

## Objetivo da aula

Transformar o chat de tela única em uma SPA com:

- navegação entre **Chat** e **Configurações**;
- múltiplas conversas listadas na **sidebar**;
- URL identificando a conversa (`/chat/:id`);
- estado global sobrevivendo à navegação;
- Prompt de Sistema em tela dedicada.

## Antes de começar

- Node.js **22.22.3+** (exigência do Angular 22).
- Comandos:

```bash
npm install
npm start
```

- Abra `http://localhost:4200`.

## Distribuição do tempo (sugestão)

| Tempo     | Etapa        | Foco                                                       |
| --------- | ------------ | ---------------------------------------------------------- |
| 0–5 min   | Demonstração | Mostrar o app pronto e o problema a resolver               |
| 5–12 min  | Passo 1      | `app.routes.ts` e `app.config.ts`                          |
| 12–22 min | Passo 2      | Sidebar, `routerLink`, `routerLinkActive`, `router-outlet` |
| 22–35 min | Passo 3      | `ChatService` com múltiplas sessões em Signals             |
| 35–43 min | Passo 4      | Tela de Prompt com `FormsModule` e `Router`                |
| 43–54 min | Passo 5      | Ler `:id` e renderizar a conversa ativa                    |
| 54–60 min | Passo 6      | Testes guiados + quiz                                      |

---

## Passo 1 — Tabela de rotas e registro do Router

**Arquivos:** `src/app/app.routes.ts`, `src/app/app.config.ts`

Conceitos para explicar:

1. `Routes` é um array tipado que mapeia `path` para `component`.
2. `redirectTo` + `pathMatch: 'full'` resolve a URL vazia.
3. A ordem importa: a primeira rota que casa vence; `'**'` fica por último.
4. `:id` é segmento dinâmico: `/chat/abc` gera `id = 'abc'`.
5. No Angular standalone, `provideRouter(routes)` substitui `RouterModule.forRoot(routes)`.

Rotas implementadas:

```ts
{ path: '', redirectTo: 'chat', pathMatch: 'full' },
{ path: 'chat', component: ChatComponent },
{ path: 'chat/:id', component: ChatComponent },
{ path: 'configuracoes', component: SystemPromptComponent },
{ path: '**', redirectTo: 'chat' },
```

Ponto de atenção: sem `provideRouter(routes)`, o `<router-outlet>` não renderiza nada e os `routerLink` não navegam.

---

## Passo 2 — Casca da aplicação e sidebar

**Arquivos:** `src/app/app.ts`, `src/app/app.html`, `src/app/app.scss`

Conceitos para explicar:

1. `router-outlet` é o “buraco” onde o componente da rota ativa é renderizado.
2. A sidebar fica **fora** do `router-outlet`: ela não é recriada a cada navegação.
3. `routerLink` navega sem recarregar a página.
4. `routerLink` com array (`['/chat', c.id]`) monta a URL com parâmetro.
5. `routerLinkActive` adiciona a classe `ativo` quando a URL corresponde ao link.
6. `[routerLinkActiveOptions]="{ exact: true }"` evita que `/chat` fique ativo também em `/chat/123`.
7. `@for` com `track c.id` atualiza só o que mudou.
8. Em standalone, cada diretiva usada precisa estar em `imports`.

Sequência didática sugerida:

- Primeiro criar o `<div class="layout">` com `<nav>` e `<main>`.
- Colocar `<router-outlet />` no `main`.
- Só depois adicionar os links.

---

## Passo 3 — Estado global com múltiplas sessões

**Arquivo:** `src/app/chat/chat.service.ts`

Conceitos para explicar:

1. **Por que o estado fica no serviço?** Ao navegar, o Angular destrói o `ChatComponent`. O serviço `providedIn: 'root'` é singleton e preserva as conversas.
2. `chats` guarda todas as conversas; `activeChatId` diz qual está aberta.
3. `activeChat` e `activeMessages` são `computed`: valores derivados, sem duplicar estado.
4. Imutabilidade: `update()` cria array/objeto novos (`spread` e `map`); mutar com `push` não notificaria os Signals.
5. `carregarConversaPorId()` liga a URL ao estado e trata id inexistente.
6. `send()` cria a conversa na primeira pergunta e devolve o `id`.
7. O `id` é capturado antes do `await` para que a resposta não caia na conversa errada se o usuário trocar de tela.
8. As conversas e mensagens são persistidas em `localStorage` (`chat-llm.chats.v1`).
9. O JSON não guarda classes do LangChain: salvamos `{ type, text }` e remontamos `HumanMessage`/`AIMessage` na leitura.
10. Ao abrir `/chat` direto (sem id), `chats` já vem preenchido do `localStorage`, então a sidebar mostra o histórico.

Estrutura da conversa:

```ts
export interface Conversa {
  id: string;
  titulo: string;
  messages: BaseMessage[];
}
```

Sequência didática sugerida:

- Começar trocando `messages` por `chats`.
- Adicionar `activeChatId` e os `computed`.
- Depois implementar `carregarConversaPorId()`.
- Adaptar `send()` para criar conversa e devolver o id.
- Por último adicionar `lerConversasSalvas()` e `persistirConversas()`.

---

## Passo 4 — Página de Prompt de Sistema

**Arquivos:** `src/app/chat/system-prompt/system-prompt.component.*`

Conceitos para explicar:

1. O componente deixou de ser filho do chat e virou **página de rota**.
2. `[(ngModel)]` é two-way binding: `[ngModel]` leva classe → tela; `(ngModelChange)` leva tela → classe.
3. `FormsModule` precisa estar em `imports`.
4. A edição é feita em uma **cópia local** (`texto`); o serviço só muda ao salvar. Assim existe cancelamento.
5. `router.navigate()` é navegação por código, usada quando há lógica/ação.
6. Ao salvar ou cancelar, voltamos para a conversa que estava aberta, se existir.
7. O prompt é salvo também em `localStorage`, então sobrevive a um reload.
8. O cabeçalho do chat mostra o prompt ativo; clique nele para abrir `/configuracoes`.

Fluxo:

```ts
protected texto = this.chat.systemPrompt();

protected salvar(): void {
  this.chat.salvarSystemPrompt(this.texto);
  const id = this.chat.activeChatId();
  this.router.navigate(id ? ['/chat', id] : ['/chat']);
}
```

---

## Passo 5 — Chat lendo o parâmetro `:id`

**Arquivos:** `src/app/chat/chat.component.ts`, `chat.component.html`

Conceitos para explicar:

1. `ActivatedRoute` dá acesso aos parâmetros da rota que criou o componente.
2. `params.subscribe()` emite agora e a cada mudança.
3. **Por que não usar só `snapshot`?** De `/chat/1` para `/chat/2` o Angular reutiliza a mesma instância; o construtor não roda de novo.
4. O getter `emConversa` usa o snapshot para decidir o título.
5. `@for` com `track $index` renderiza o histórico; `@if` substitui `*ngIf`.
6. Depois de criar uma conversa em `/chat`, `router.navigate(['/chat', id])` coloca o id na URL.

Fluxo principal:

```ts
constructor() {
  this.route.params.subscribe((params) =>
    this.chat.carregarConversaPorId(params['id'] ?? null),
  );
}

protected async submit(): Promise<void> {
  const q = this.query();
  this.query.set('');
  const id = await this.chat.send(q);
  if (id && !this.emConversa) this.router.navigate(['/chat', id]);
}
```

---

## Passo 6 — Prática: roteiro de testes no WebStorm

Execute `npm start` e valide na ordem:

1. **Redirecionamento**
   - Abra `http://localhost:4200/`.
   - Esperado: URL vira `/chat` e o título é “Nova conversa”.

2. **Primeira conversa**
   - Envie “O que é Angular?”.
   - Esperado: URL vira `/chat/<uuid>`; a resposta aparece; a sidebar mostra o título.

3. **Item ativo**
   - Confira se o item da conversa fica destacado na sidebar.
   - “+ Nova conversa” **não** deve ficar destacado em `/chat/<id>`.

4. **Nova conversa**
   - Clique em “+ Nova conversa”.
   - Envie outra pergunta.
   - Esperado: duas conversas na sidebar, cada uma com seu histórico.

5. **Troca de conversa**
   - Clique na primeira conversa.
   - Esperado: o histórico antigo reaparece e a URL volta para o id dela.

6. **Prompt de Sistema**
   - Abra “Configurações”.
   - Edite o prompt e clique em “Salvar”.
   - Esperado: volta para a conversa que estava aberta; o cabeçalho mostra “Prompt ativo: ...”.
   - Envie uma pergunta e confira no DevTools (Network) se o corpo da requisição tem `"system": "..."`.
   - Dica: use uma instrução bem visível, como “Responda sempre começando com [TESTE]”.
   - Repita com “Cancelar”: a alteração deve ser descartada.

7. **Rota inexistente**
   - Acesse `http://localhost:4200/qualquer-coisa`.
   - Esperado: redireciona para `/chat`.

8. **Id inexistente**
   - Acesse `http://localhost:4200/chat/id-que-nao-existe`.
   - Esperado: tela de “Nova conversa”, sem erro.

9. **Recarregar a página e acesso direto**
   - Atualize o navegador em `/chat`.
   - Esperado: a sidebar continua listando as conversas e cada uma mantém suas mensagens.
   - Acesse `/chat/<id>` direto: a conversa correspondente é carregada.
   - Acesse `/chat` sem id: a sidebar lista as conversas, mas nenhuma fica ativa; o título é “Nova conversa”.
   - O Prompt de Sistema também continua salvo, pois tudo é persistido em `localStorage`.

10. **Console**
    - Confira se não há erros de template nem avisos de rota.

### Checkpoints de código no WebStorm

- `Ctrl/Cmd + clique` em `provideRouter` e em `RouterOutlet` para abrir as definições.
- `Alt + Enter` para importar automaticamente símbolos usados no template.
- `Ctrl/Cmd + F` e procure por `data-label` para localizar cada parte didática.
- Use o painel **Problems** para conferir imports não utilizados.

---

## Quiz de fixação

1. Qual a diferença entre `<router-outlet>` e `routerLink`?
2. Por que usamos `provideRouter(routes)` no `app.config.ts`?
3. Por que o estado das conversas fica no `ChatService` e não no `ChatComponent`?
4. Por que `activeMessages` é um `computed` e não um `signal` separado?
5. Por que usamos `params.subscribe()` em vez de apenas `route.snapshot`?
6. Por que `[routerLinkActiveOptions]="{ exact: true }"` é necessário no link `/chat`?
7. Por que o `ChatService` usa `map`/`spread` no `update()` em vez de `push`?
8. Por que `send()` captura o `id` antes do `await`?
9. Por que a tela de configurações usa uma cópia local do prompt?
10. Como as conversas sobrevivem ao reload? Qual formato é salvo no `localStorage`?

### Gabarito comentado

1. `router-outlet` define **onde** renderizar o componente da rota; `routerLink` define **como navegar**.
2. Porque registra o roteador e a tabela de rotas na injeção de dependências; é o equivalente standalone do `RouterModule.forRoot(routes)`.
3. O componente é destruído ao navegar; o serviço singleton mantém o estado vivo.
4. Porque as mensagens ativas são derivadas de `chats` + `activeChatId`; duplicar criaria risco de dessincronização.
5. Porque ao trocar de `/chat/1` para `/chat/2` o componente é reutilizado; o snapshot ficaria desatualizado.
6. Porque o match padrão é por prefixo; sem `exact`, `/chat` ficaria ativo também em `/chat/123`.
7. Signals detectam mudança por referência; mutar o array no lugar não dispara atualização.
8. Para garantir que a resposta da IA seja gravada na conversa correta mesmo se o usuário trocar de tela durante a chamada.
9. Para permitir cancelar a edição; alterar o signal a cada tecla aplicaria a mudança imediatamente.
10. O `ChatService` salva um JSON em `chat-llm.chats.v1` com `{ id, titulo, messages: [{ type, text }] }`. Na inicialização, `lerConversasSalvas()` lê esse JSON e remonta `HumanMessage`/`AIMessage`, pois o JSON não preserva as classes do LangChain.

---

## Desafios extras (se sobrar tempo)

- Migrar a persistência de `localStorage` para IndexedDB ou backend.
- Adicionar botão para excluir uma conversa da sidebar (lembrando de atualizar o `localStorage`).
- Criar um `titulo` editável para a conversa.
- Destacar a rota ativa com `aria-current`.
- Renomear a rota `/configuracoes` para `/configuracoes/prompt`.
