import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { TrendingComponent } from './trending/trending.component';
import { AboutComponent } from './about/about.component';
import { RecomendationComponent } from './recomendation/recomendation.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    TrendingComponent,
    AboutComponent,
    RecomendationComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
