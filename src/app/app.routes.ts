import { Routes } from '@angular/router';
import {ChatComponent} from "./chat/chat.component";
import {SystemPromptComponent} from "./chat/system-prompt/system-prompt.component";

export const routes: Routes = [
    {path: '', component: ChatComponent},
    {path: 'configuracoes', component: SystemPromptComponent},
];