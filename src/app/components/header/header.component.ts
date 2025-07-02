import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  contact() {
    window.open('https://www.linkedin.com/in/walysson-cavalcante', '_blank');
  }
}
