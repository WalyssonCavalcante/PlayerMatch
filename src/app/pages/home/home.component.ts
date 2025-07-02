import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { TrendingComponent } from './trending/trending.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, TrendingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
