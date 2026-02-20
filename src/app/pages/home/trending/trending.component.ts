import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GamesService } from '../../../services/games.service';
import { isPlatformBrowser } from '@angular/common';

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
  private readonly isBrowser: boolean;

  constructor(
    private gamesService: GamesService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.isLoading = false;
      return;
    }

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
