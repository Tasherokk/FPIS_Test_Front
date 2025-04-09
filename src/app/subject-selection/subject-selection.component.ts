import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { FormsModule } from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-subject-selection',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './subject-selection.component.html',
  styleUrl: './subject-selection.component.css',
})
export class SubjectSelectionComponent implements OnInit{
  // Массив пар предметов с кодами
  availablePairs = [
    { pair: ['WHI', 'GEO'], name: 'Дүниежүзілік тарих және География' },
    { pair: ['WHI', 'LF'], name: 'Дүниежүзілік тарих және Құқық негіздері' },
    { pair: ['GEO', 'FL'], name: 'География және Шет тілі' },
    { pair: ['BIO', 'GEO'], name: 'Биология және География' },
    { pair: ['FL', 'WHI'], name: 'Шет тілі және Дүниежүзілік тарих' },
    { pair: ['KZ', 'KL'], name: 'Қазақ тілі және Қазақ әдебиеті' },
    { pair: ['MAT', 'GEO'], name: 'Математика және География' },
    { pair: ['MAT', 'INF'], name: 'Математика және Информатика' },
    { pair: ['MAT', 'PHY'], name: 'Математика және Физика' },
    { pair: ['RU', 'RUL'], name: 'Русский язык и Русская литература' },
    { pair: ['CHE', 'BIO'], name: 'Химия және Биология' },
    { pair: ['CHE', 'PHY'], name: 'Химия және Физика' },
  ];

  selectedPair: string | undefined;
  isAgreed: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  isBlocked: boolean = false;

  constructor(private apiService: ApiService, private router: Router) {
    if (!sessionStorage.getItem('user')) {
      this.router.navigate(['/']);
    }
    if (sessionStorage.getItem('testRetrieved') == 'true') {
      this.router.navigate(['/test']);
    }
  }

  ngOnInit() {
  }

  startTest() {
    if (this.selectedPair) {
      const selected = this.availablePairs.find(pair => pair.name === this.selectedPair);
      if (selected) {
        const subjects = selected.pair;
        this.isLoading = true;
        this.apiService.generateTest(subjects).subscribe(
          (response: { test: any; }) => {
            this.isLoading = false;
            this.isBlocked = false;
            this.errorMessage = ''
            sessionStorage.removeItem('testCompleted');
            sessionStorage.setItem('testRetrieved', 'true');
            sessionStorage.setItem('testData', JSON.stringify(response.test));
            this.router.navigate(['/test']);
          },
          (error: any) => {
            this.isLoading = false;
            this.isBlocked = true;
            if (error.status === 429) {
              const retryAfter = error.headers.get('Retry-After');
              console.log(retryAfter)
              const retryAfterSeconds = parseInt(retryAfter, 10);

              if (retryAfterSeconds) {
                const hours = Math.floor(retryAfterSeconds / 3600);
                const minutes = Math.floor((retryAfterSeconds % 3600) / 60);
                const seconds = retryAfterSeconds % 60;
                this.errorMessage = `Барлық мүмкіндіктер таусылды. ${hours} сағат ${minutes} минут ${seconds} секундтан кейін қайталап көріңіз.`;
              } else {
                this.errorMessage = `Барлық мүмкіндіктер таусылды. Кейінірек қайталап көріңіз.`;
              }
            } else {
              console.error('Error generating test', error);
            }
          }
        );
      }
    }
  }
}
