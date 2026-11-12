import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SystemPromptComponent } from './system-prompt/system-prompt.component';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, SystemPromptComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  protected readonly chat = inject(ChatService);
  protected readonly query = signal('');
  protected readonly visibleMessages = computed(() =>
    this.chat.messages().filter((m) => m.type !== 'system'),
  );

  protected async submit(): Promise<void> {
    const q = this.query();
    this.query.set('');
    await this.chat.send(q);
  }
}
