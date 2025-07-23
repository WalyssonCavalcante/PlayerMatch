import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { GamesService } from '../../services/games.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent {
  quizAnswers: string[] = ['', '', ''];
  recommendation: string = '';
  loading: boolean = false;
  gameData: any = null;

  constructor(
    private geminiService: GeminiService,
    private gamesService: GamesService
  ) {}
  async submitQuiz() {
    this.loading = true;
    this.recommendation = '';
    this.gameData = null;

    try {
      const response = await this.geminiService.getGameRecommendation(
        this.quizAnswers
      );

      this.recommendation = response;

      const gameName = this.extractGameName(response);
      const data = await firstValueFrom(
        this.gamesService.searchGameByName(gameName)
      );

      if (data.results && data.results.length > 0) {
        this.gameData = data.results[0];
      }
    } catch (error) {
      console.error('Erro ao obter recomendação da IA:', error);
      this.recommendation =
        'Erro ao obter recomendação da IA. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
  extractGameName(text: string): string {
    const firstLine = text.split('\n')[0];
    return firstLine.split('(')[0].trim();
  }
  get platformList(): string {
    return (
      this.gameData?.platforms?.map((p: any) => p.platform.name).join(', ') ??
      ''
    );
  }
}
