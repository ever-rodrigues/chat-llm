import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { SystemPromptComponent } from './chat/system-prompt/system-prompt.component';

/*
 * [AULA · Conceito 2 — Tabela de rotas]
 * Em projetos com NgModules isto ficava em app-routing.module.ts com RouterModule.forRoot(routes).
 * No Angular moderno (standalone) a tabela é só um array tipado `Routes`, registrado em
 * app.config.ts com provideRouter(routes). Mesmo conceito: mapear `path` -> componente.
 *
 * A ORDEM IMPORTA: o Angular usa a primeira rota que casar, por isso o curinga '**' fica por último.
 */
export const routes: Routes = [
  // [Conceito 7 — Redirecionamento] Sem path (http://localhost:4200/) cai em /chat.
  // pathMatch: 'full' = só redireciona se a URL for exatamente vazia.
  { path: '', redirectTo: 'chat', pathMatch: 'full' },

  // Rota estática: abre uma conversa nova (ainda sem id).
  { path: 'chat', component: ChatComponent },

  // [Conceito 5 — Parâmetro de rota] ':id' é um segmento dinâmico: /chat/abc123 -> id = 'abc123'.
  // É o MESMO componente das duas rotas; quem diferencia é a presença do parâmetro.
  { path: 'chat/:id', component: ChatComponent },

  // Página dedicada ao Prompt de Sistema (não fica mais dentro do chat).
  { path: 'configuracoes', component: SystemPromptComponent },

  // Qualquer URL desconhecida volta para o chat (evita tela em branco / erro de rota).
  { path: '**', redirectTo: 'chat' },
];
