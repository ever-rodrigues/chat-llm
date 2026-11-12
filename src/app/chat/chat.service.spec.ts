import { TestBed } from '@angular/core/testing';
import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { LlmClient } from '../core/llm/llm-client';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  beforeEach(() => localStorage.clear());

  function criarServico() {
    const invoke = vi.fn().mockResolvedValue(new AIMessage('ok'));
    TestBed.configureTestingModule({
      providers: [{ provide: LlmClient, useValue: { invoke } }],
    });
    return { service: TestBed.inject(ChatService), invoke };
  }

  it('envia o prompt salvo como SystemMessage antes da pergunta', async () => {
    const { service, invoke } = criarServico();
    service.salvarSystemPrompt('Você é o Batman.');

    await service.send('Quem é você?');

    const payload = invoke.mock.calls[0][0];
    expect(payload[0]).toBeInstanceOf(SystemMessage);
    expect(payload[0].text).toBe('Você é o Batman.');
    expect(payload[1].text).toBe('Quem é você?');
  });

  it('recupera o prompt salvo do localStorage', () => {
    localStorage.setItem('chat-llm.systemPrompt', 'Prompt persistido');

    const { service } = criarServico();

    expect(service.systemPrompt()).toBe('Prompt persistido');
  });

  it('persiste conversas e mensagens e recarrega em um novo serviço', async () => {
    const { service } = criarServico();
    const id = await service.send('Pergunta persistida');

    expect(localStorage.getItem('chat-llm.chats.v1')).toContain('Pergunta persistida');

    TestBed.resetTestingModule();
    const { service: recarregado } = criarServico();

    expect(recarregado.chats()).toHaveLength(1);
    expect(recarregado.chats()[0].id).toBe(id);
    expect(recarregado.chats()[0].messages.map((m) => [m.type, m.text])).toEqual([
      ['human', 'Pergunta persistida'],
      ['ai', 'ok'],
    ]);

    recarregado.carregarConversaPorId(id);
    expect(recarregado.activeMessages()).toHaveLength(2);
  });

  it('mantém o erro visível ao navegar para a conversa recém-criada', async () => {
    const invoke = vi.fn().mockRejectedValue(new Error('401 invalid x-api-key'));
    TestBed.configureTestingModule({
      providers: [{ provide: LlmClient, useValue: { invoke } }],
    });
    const service = TestBed.inject(ChatService);

    const id = await service.send('Pergunta sem chave válida');
    expect(service.error()).toContain('invalid x-api-key');

    // É exatamente o que o ChatComponent faz depois do send: navega para /chat/:id.
    // O id é o mesmo que criarConversa já gravou, então o erro NÃO pode ser limpo.
    service.carregarConversaPorId(id);
    expect(service.error()).toContain('invalid x-api-key');

    // Já trocar de conversa limpa o aviso da conversa anterior.
    service.carregarConversaPorId(null);
    expect(service.error()).toBeNull();
  });
});
