import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GamesService } from '../../../services/games.service';

@Component({
  selector: 'app-recomendation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recomendation.component.html',
  styleUrl: './recomendation.component.scss',
})
export class RecomendationComponent {
  recommendedGames: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private gamesService: GamesService) {}

  ngOnInit(): void {
    this.loadRecommendedGames();
  }

  loadRecommendedGames(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.gamesService.getRandomGames().subscribe({
      next: (data) => {
        this.recommendedGames = data.results || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading recommended games:', err);
        this.errorMessage =
          'Failed to load recommendations. Please try again later.';
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
