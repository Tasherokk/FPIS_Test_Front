// api.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ApiService {
  private baseUrl = 'https://api.oysana.site';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    });
  }

  login(iin: string | undefined, password: string | undefined): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/login/`, { iin, password }).pipe(
      catchError(this.handleError)
    );
  }

  generateTest(selectedSubjects: (string | undefined)[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/generate_test/`, { selected_subjects: selectedSubjects }, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  submitAnswers(answers: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/submit_answers/`, { answers: answers }, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    // Handle the error appropriately in your application
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
