import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  // [AULA] Em standalone, cada diretiva/componente usado no template precisa estar
  // em `imports`. A casca só usa o <router-outlet> e o <app-sidebar>: o routerLink e
  // o routerLinkActive agora vivem na SidebarComponent, que importa o que precisa.
  imports: [RouterOutlet, SidebarComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
