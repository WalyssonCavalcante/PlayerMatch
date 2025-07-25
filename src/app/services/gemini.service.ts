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
    'API-KEY'
  );

  async getGameRecommendation(quizAnswers: string[]): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Sou um assistente que recomenda jogos. Com base nas respostas do quiz abaixo, sugira apenas 1 jogo ideal no seguinte formato:

    Nome: [nome do jogo]
    Gênero: [gênero do jogo]
    Descrição: [uma breve explicação de por que ele combina com o humor atual]

    Respostas do quiz:
    ${quizAnswers.map((q, i) => `Q${i + 1}: ${q}`).join('\n')}

    Não adicione nada além desse formato.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
