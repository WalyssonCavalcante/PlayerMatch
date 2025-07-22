import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

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

  constructor(private geminiService: GeminiService) {}

  async submitQuiz() {
    this.loading = true;
    this.recommendation = '';

    try {
      this.recommendation = await this.geminiService.getGameRecommendation(
        this.quizAnswers
      );
    } catch (error) {
      console.error('Erro ao obter recomendação da IA:', error);
      this.recommendation =
        'Erro ao obter recomendação da IA. Tente novamente.';
    }

    this.loading = false;
  }
}
