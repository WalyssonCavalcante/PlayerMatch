import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  private apiKey = 'ffe71b0551694ccc827653eeae25eca2';
  private apiUrl = 'https://api.rawg.io/api/games';

  constructor(private http: HttpClient) {}

  getMostPlayedGames(): Observable<any> {
    const params = {
      ordering: '-popularity',
      page_size: '5',
      key: this.apiKey,
    };

    return this.http
      .get<any>(this.apiUrl, { params })
      .pipe(retry(2), catchError(this.handleError));
  }

  getRandomGames(): Observable<any> {
    const params = {
      ordering: '',
      page_size: '18',
      key: this.apiKey,
      page: Math.floor(Math.random() * 500) + 1,
    };

    return this.http
      .get<any>(this.apiUrl, { params })
      .pipe(retry(2), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
