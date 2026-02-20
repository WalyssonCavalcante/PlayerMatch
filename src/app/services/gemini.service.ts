import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  constructor(private http: HttpClient) {}

  async getGameRecommendation(quizAnswers: string[]): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<{ recommendation: string }>('/api/gemini', {
        quizAnswers,
      }),
    );
    return response.recommendation;
  }
}
