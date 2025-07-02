import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GamesService } from '../../../services/games.service';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trending.component.html',
  styleUrl: './trending.component.scss',
})
export class TrendingComponent implements OnInit {
  mostPlayedGames: any[] = [];
  isLoading = true;

  constructor(private gamesService: GamesService) {}

  ngOnInit(): void {
    this.gamesService.getMostPlayedGames().subscribe({
      next: (data) => {
        this.mostPlayedGames = data.results || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.isLoading = false;
      },
    });
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'excellent';
    if (rating >= 4.0) return 'great';
    if (rating >= 3.0) return 'good';
    return 'average';
  }

  getPlatforms(game: any): string {
    if (!game.platforms || !game.platforms.length)
      return 'Plataformas indisponíveis';

    const uniquePlatforms = new Set<string>();

    game.platforms.forEach(
      (p: { platform: { slug: string; name: string } }) => {
        const slug = p.platform.slug;

        if (slug === 'pc' || slug === 'mac' || slug === 'linux') {
          uniquePlatforms.add('PC');
        } else {
          uniquePlatforms.add(p.platform.name);
        }
      }
    );

    return Array.from(uniquePlatforms).join(', ');
  }
}
