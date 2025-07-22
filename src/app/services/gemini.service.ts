import { Injectable } from '@angular/core';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI = new GoogleGenerativeAI(
    'AIzaSyDp9rpdVkt3vU56KlPHOjUbWNE3XY7bAtw'
  );

  async getGameRecommendation(quizAnswers: string[]): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Sou um assistente que recomenda jogos. Com base nas respostas do quiz abaixo, sugira um jogo perfeito, com gênero e uma breve explicação:

Respostas do quiz:
${quizAnswers.map((q, i) => `Q${i + 1}: ${q}`).join('\n')}

Responda apenas com o nome do jogo, gênero e uma explicação curta.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
