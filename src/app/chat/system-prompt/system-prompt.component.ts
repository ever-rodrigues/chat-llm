import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-system-prompt',
  imports: [FormsModule],
  templateUrl: './system-prompt.component.html',
  styleUrl: './system-prompt.component.scss',
})
export class SystemPromptComponent {
  protected readonly chat = inject(ChatService);
}
