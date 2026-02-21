import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.use(express.json());

  // Local/SSR API endpoints so "/api/*" does not fall through to Angular routes.
  server.get('/api/rawg', async (req, res) => {
    const apiKey = process.env['RAWG_API_KEY'];
    if (!apiKey) {
      res.status(500).json({ error: 'RAWG_API_KEY is not configured' });
      return;
    }

    const type = req.query['type'];
    const baseUrl = 'https://api.rawg.io/api/games';
    const params = new URLSearchParams({ key: apiKey });

    if (type === 'search') {
      const name = (req.query['name'] || '').toString().trim();
      if (!name) {
        res.status(400).json({ error: 'name is required for search' });
        return;
      }
      params.set('search', name);
    } else if (type === 'most-played') {
      params.set('ordering', '-popularity');
      params.set('page_size', '5');
    } else if (type === 'random') {
      params.set('page_size', '18');
      params.set('page', (Math.floor(Math.random() * 500) + 1).toString());
    } else {
      res.status(400).json({ error: "type must be 'search', 'most-played' or 'random'" });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}?${params.toString()}`);
      if (!response.ok) {
        const errorText = await response.text();
        res.status(response.status).json({ error: errorText || 'RAWG request failed' });
        return;
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('RAWG API error:', error);
      res.status(500).json({ error: 'Failed to fetch RAWG data' });
    }
  });

  server.post('/api/gemini', async (req, res) => {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
      return;
    }

    const { quizAnswers } = req.body || {};
    if (!Array.isArray(quizAnswers) || quizAnswers.length === 0) {
      res.status(400).json({ error: 'quizAnswers must be a non-empty array' });
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env['GEMINI_MODEL'] || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `Sou um assistente que recomenda jogos. Com base nas respostas do quiz abaixo, sugira apenas 1 jogo ideal no seguinte formato:

Nome: [nome do jogo]
Gênero: [gênero do jogo]
Descrição: [uma breve explicação de por que ele combina com o humor atual]

Respostas do quiz:
${quizAnswers.map((q, i) => `Q${i + 1}: ${q}`).join('\n')}

Não adicione nada além desse formato.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.status(200).json({ recommendation: response.text(), model: modelName });
    } catch (error) {
      console.error('Gemini API error:', error);
      const status = Number((error as any)?.status || (error as any)?.statusCode || 500);
      const message =
        (error as any)?.message ||
        (error as any)?.errorDetails?.[0]?.reason ||
        'Failed to generate recommendation';
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: 'Gemini request failed',
        details: message,
      });
    }
  });

  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
