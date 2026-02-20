import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  constructor(private http: HttpClient) {}

  searchGameByName(name: string): Observable<any> {
    const url = `/api/rawg?type=search&name=${encodeURIComponent(name)}`;
    return this.http.get<any>(url);
  }

  getMostPlayedGames(): Observable<any> {
    return this.http
      .get<any>('/api/rawg?type=most-played')
      .pipe(retry(2), catchError(this.handleError));
  }

  getRandomGames(): Observable<any> {
    return this.http
      .get<any>('/api/rawg?type=random')
      .pipe(retry(2), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro!';
    const hasBrowserErrorEvent =
      typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent;

    if (hasBrowserErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
