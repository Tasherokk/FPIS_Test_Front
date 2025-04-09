// result.component.ts

import { Component, OnInit } from '@angular/core';
import {NgForOf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css',
  standalone: true,
  imports: [
    NgForOf
  ]
})
export class ResultComponent implements OnInit {
  testResult: any;

  subjectNames: { [key: string]: string } = {
    'HIS': 'Қазақстан Тарихы',
    'MAT': 'Математика',
    'PHY': 'Физика',
    'CHE': 'Химия',
    'RL': 'Оқу сауаттылығы',
    'ML': 'Математикалық сауаттылық',
    'WHI': 'Дүниежүзілік тарих',
    'GEO': 'География',
    'LF': 'Құқық негіздері',
    'FL': 'Шет тілі',
    'BIO': 'Биология',
    'KZ': 'Қазақ тілі',
    'KL': 'Қазақ әдебиеті',
    'INF': 'Информатика',
    'RU': 'Русский язык',
    'RUL': 'Русская литература'
  };

  constructor(private router: Router) {
    if (!sessionStorage.getItem('user')) {
      this.router.navigate(['/']);
    }
    if (!sessionStorage.getItem('testCompleted')) {
      this.router.navigate(['/test']);
    }
  }

  ngOnInit() {
    const data = sessionStorage.getItem('testResult');
    if (data) {
      this.testResult = JSON.parse(data);
    } else {
      // Handle case when test result is not available
    }
  }

  backToMainPage() {
    sessionStorage.removeItem('answers');
    sessionStorage.removeItem('reviewMode');
    sessionStorage.removeItem('testCompleted');
    sessionStorage.removeItem('correctAnswers');
    sessionStorage.removeItem('testResult');
    sessionStorage.removeItem('testRetrieved');
    this.router.navigate(['/select']);
  }

  reviewMistakes() {
    this.router.navigate(['/test']);
  }

}
