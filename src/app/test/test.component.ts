import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {TestSummaryComponent} from '../test-summary/test-summary.component';
import {CdkDrag} from '@angular/cdk/drag-drop';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgClass,
    TestSummaryComponent,
    CdkDrag,
    MatSelectModule,
    MatFormFieldModule
  ],
})
export class TestComponent implements OnInit, OnDestroy {

  isReviewMode= false;

  @HostListener('document:visibilitychange', ['$event'])
  onVisibilityChange(event: Event) {
    // Если вкладка скрылась (пользователь переключился)
    if (document.hidden && !this.isReviewMode) {
      // Вызываем метод, который отправит тест на сервер
      this.submitAnswers();
    }
  }

  correctAnswers = null;

  testData: any[] = [];
  answers: any = {};
  full_name: string | null = '';
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

  currentSubjectIndex: number = 0;
  currentQuestionIndex: number = 0;
  currentSubject: any;

  showSummary = false;

  showCalculator: boolean = false;
  showPeriodicTable: boolean = false;
  showSolvetyTable: boolean = false;

  expression: string = '';

  totalQuizTime = 14400;
  timeLeft: number = this.totalQuizTime;
  timerInterval: any;

  isSubmitting = false;

  constructor(private apiService: ApiService, private router: Router) {
    if (!sessionStorage.getItem('user')) {
      this.router.navigate(['/']);
    }
    else {
      this.full_name = sessionStorage.getItem('full_name');
    }
    // if (sessionStorage.getItem('testCompleted') == 'true') {
    //   this.router.navigate(['/result']);
    // }
    if (!sessionStorage.getItem('testRetrieved')) {
      this.router.navigate(['/select']);
    }
  }


  ngOnInit() {
    const reviewModeValue = sessionStorage.getItem('reviewMode');
    this.isReviewMode = reviewModeValue === 'true';
    if(this.isReviewMode) {
      clearInterval(this.timerInterval);
      const correctAnswersString = sessionStorage.getItem('correctAnswers');
      if (correctAnswersString) {
        const correctAnswersObj = JSON.parse(correctAnswersString);
        if (correctAnswersObj) {
          this.correctAnswers = correctAnswersObj;
        }
      }
    }
    if(!this.isReviewMode) {
      this.initializeTimer();
    }
    const savedAnswers = sessionStorage.getItem('answers');
    const data = sessionStorage.getItem('testData');
    if (data) {
      this.testData = JSON.parse(data);
      if (savedAnswers) {
        this.answers = JSON.parse(savedAnswers);
      }
      else {
        this.initAnswers();
      }
      this.loadCurrentSubject();
    } else {
      this.router.navigate(['/select']);
    }
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }



  initAnswers() {
    this.testData.forEach(subject => {
      if (!this.answers[subject.id]) {
        this.answers[subject.id] = {};
      }
      subject.questions.forEach((question: { id: string | number; question_type: string; }) => {
        this.answers[subject.id][question.id] = question.question_type === 'SC' ? null : question.question_type === 'MT' ? {} : [];
      });
    });
  }

  loadCurrentSubject() {
    this.currentSubject = this.testData[this.currentSubjectIndex];
  }

  nextSubject() {
    if (this.currentSubjectIndex < this.testData.length - 1) {
      this.currentSubjectIndex++;
      this.currentQuestionIndex = 0;
      this.loadCurrentSubject();
    }
  }

  previousSubject() {
    if (this.currentSubjectIndex > 0) {
      this.currentSubjectIndex--;
      this.loadCurrentSubject();
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.currentSubject.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
  }

  isQuestionAnswered(subjectId: number, questionId: number, questionType: string): boolean {
    const answer = this.answers[subjectId][questionId];
    return questionType === 'SC' ? answer !== null : questionType === 'MC' ? Array.isArray(answer) && answer.length > 0
      : typeof answer === 'object' && Object.keys(answer).length > 1;
  }

  recordAnswer(subjectId: number, questionId: number, answerIds: number[]) {
    this.answers[subjectId][questionId] = answerIds;
    this.saveProgress();
  }

  toggleCheckboxAnswer(subjectId: number, questionId: number, answerId: number, event: any) {
    if (event.target.checked) {
      this.answers[subjectId][questionId].push(answerId);
    } else {
      const index = this.answers[subjectId][questionId].indexOf(answerId);
      if (index > -1) {
        this.answers[subjectId][questionId].splice(index, 1);
      }
    }
    this.saveProgress();
  }

  recordMatchingAnswer(subjectId: number, questionId: number, leftSide: string, selectedOption: number) {
    this.answers[subjectId][questionId][leftSide] = parseInt(String(selectedOption), 10);
    this.saveProgress();
  }

  saveProgress() {
    sessionStorage.setItem('answers', JSON.stringify(this.answers));
  }

  onCancelSubmit() {
    this.showSummary = false;
  }

  onSubmit() {
    this.showSummary = true;
  }

  submitAnswers() {
    this.isSubmitting = true;
    this.apiService.submitAnswers(this.answers).subscribe(
      (response) => {
        sessionStorage.setItem('testCompleted', 'true');
        sessionStorage.setItem('testResult', JSON.stringify(response));
        sessionStorage.setItem('correctAnswers', JSON.stringify(response.correct_answers));
        // sessionStorage.removeItem('testRetrieved');
        // sessionStorage.removeItem('answers');
        clearInterval(this.timerInterval);
        sessionStorage.removeItem('quizEndTime');
        this.isSubmitting = false;
        sessionStorage.setItem('reviewMode', 'true');
        this.router.navigate(['/result']);
      },
      (error) => {
        console.error('Error submitting answers', error);
        this.isSubmitting = false;
      }
    );
  }


  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key;

    if (!isNaN(Number(key))) {
      // Number keys (0-9)
      this.appendToExpression(key);
    } else if (key === '+') {
      this.appendToExpression('+');
    } else if (key === '-') {
      this.appendToExpression('-');
    } else if (key === '*') {
      this.appendToExpression('*');
    } else if (key === '/') {
      this.appendToExpression('/');
    } else if (key === '%') {
      this.appendToExpression('%');
    } else if (key === 'Backspace') {
      this.backspace();
    } else if (key === 'Enter' || key === '=') {
      this.calculate();
    } else if (key === '.') {
      this.appendToExpression('.');
    } else if (key === 'Escape') {
      this.clear();
    }
  }


  initializeTimer() {
    const storedEndTime = sessionStorage.getItem('quizEndTime');
    const currentTime = new Date().getTime();

    if (storedEndTime && parseInt(storedEndTime) > currentTime) {
      this.timeLeft = Math.floor((parseInt(storedEndTime) - currentTime) / 1000);
    } else {
      const endTime = currentTime + this.totalQuizTime * 1000;
      sessionStorage.setItem('quizEndTime', endTime.toString());
      this.timeLeft = this.totalQuizTime;
    }

    this.startTimer();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.submitAnswers();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }





  togglePeriodicTable() {
    this.showPeriodicTable = true;
    this.showCalculator = false;
    this.showSolvetyTable= false;
  }
  toggleSolvetyTable() {
    this.showSolvetyTable = true;
    this.showCalculator = false;
    this.showPeriodicTable = false;

  }
  toggleCalculator() {
    this.showCalculator = true;
    this.showPeriodicTable = false;
    this.showSolvetyTable = false;
  }




  appendToExpression(value: string) {
    if (this.isOperator(value) && (this.isOperator(this.expression.slice(-1)))) {
      return;
    }
    if (value === '%') {
      if (this.expression && !this.isOperator(this.expression.slice(-1))) {
        this.expression += '*0.01';
      } else {
        return;
      }
    } else {
      this.expression += value;
    }
  }
  calculate() {
    if (this.expression.length==0){
      return;
    }
    try {
      const result = new Function('return ' + this.sanitizeExpression(this.expression))();
      this.expression = result.toString();
    } catch (error) {
      this.expression = 'Error';
    }
  }
  clear() {
    this.expression = '';
  }
  clearEntry() {
    this.expression = this.expression.slice(0, this.expression.lastIndexOf(' ') + 1);
  }
  backspace() {
    this.expression = this.expression.slice(0, -1);
  }
  calculateSquare() {
    if (this.expression) {
      try {
        this.expression = `${new Function('return ' + this.expression)() ** 2}`;
      } catch {
        this.expression = 'Error';
      }
    }
  }
  calculateSquareRoot() {
    if (this.expression) {
      try {
        this.expression = `${Math.sqrt(new Function('return ' + this.expression)())}`;
      } catch {
        this.expression = 'Error';
      }
    }
  }
  toggleSign() {
    if (this.expression) {
      if (this.expression.startsWith('-')) {
        this.expression = this.expression.slice(1);
      } else {
        this.expression = '-' + this.expression;
      }
    }
  }
  isOperator(char: string) {
    return ['+', '-', '*', '/', '%', '.'].includes(char);
  }
  sanitizeExpression(expression: string) {
    return expression.replace(/([0-9.]+)%/g, '($1*0.01)');
  }


  closeCalculator(){
    this.showCalculator=!this.showCalculator
  }
  closePeriodicTable(){
    this.showPeriodicTable=!this.showPeriodicTable
  }
  closeSolvetyTable(){
    this.showSolvetyTable=!this.showSolvetyTable
  }


  isUserSelectedThisAnswer(subjectId: number, questionId: number, answerId: number): boolean {
    if (!this.correctAnswers) return false;
    // @ts-ignore
    const userAnswers = this.answers[subjectId][questionId];

    if (!userAnswers) return false;
    let userAnswerArray = Array.isArray(userAnswers) ? userAnswers : [userAnswers];

    const userChoseThis = userAnswerArray.includes(answerId);

    return userChoseThis;
  }

  isThisCorrectAnswer(subjectId: number, questionId: number, answerId: number): boolean {
    if (!this.correctAnswers) return false;
    // @ts-ignore
    const questionCorrectAnswers = this.correctAnswers[subjectId]?.[questionId]?.correct_answers;
    if (!questionCorrectAnswers) return false;

    return questionCorrectAnswers.includes(answerId);
  }


  isMatchingCorrect(subjectId: number, questionId: number, leftSideKey: string): boolean {
    if (!this.correctAnswers) return false;
    // @ts-ignore
    const correctSet = this.correctAnswers[subjectId]?.[questionId]?.correct_answers;
    const userSet = this.answers[subjectId][questionId];
    if (!correctSet || !userSet) return false;

    return correctSet[leftSideKey] === userSet[leftSideKey];
  }

  isQuestionCorrect(subjectId: number, questionId: number): boolean {
    if (!this.correctAnswers || !this.correctAnswers[subjectId] || !this.correctAnswers[subjectId][questionId]) {
      return false;
    }

    // @ts-ignore
    const questionCorrectAnswers = this.correctAnswers[subjectId][questionId].correct_answers;
    // @ts-ignore
    const questionType = this.correctAnswers[subjectId][questionId].question_type;
    const userAnswer = this.answers[subjectId][questionId];

    if (questionType === 'SC') {
      if (!userAnswer || userAnswer.length === 0) return false;
      const userAnswerId = userAnswer[0];
      const correctId = questionCorrectAnswers[0];
      return userAnswerId === correctId;
    }

    if (questionType === 'MC') {
      if (!userAnswer || userAnswer.length === 0) return false;
      const userSet = new Set(userAnswer);
      const correctSet = new Set(questionCorrectAnswers);
      return userSet.size === correctSet.size && [...userSet].every(id => correctSet.has(id));
    }

    if (questionType === 'MT') {
      if (!userAnswer) return false;
      return (
        userAnswer.left_side_1 === questionCorrectAnswers.left_side_1 &&
        userAnswer.left_side_2 === questionCorrectAnswers.left_side_2
      );
    }

    return false;
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

  backToResultPage() {
    this.router.navigate(['/result']);
  }


  getHTMLForValue(value: number): string {
    if (!value) {
      return '';
    }

    const question = this.currentSubject.questions[this.currentQuestionIndex];
    if (!question || !question.matching_pairs || question.matching_pairs.length === 0) {
      return '';
    }

    const pair = question.matching_pairs[0];

    switch (value) {
      case 1:
        return pair.right_option_1;
      case 2:
        return pair.right_option_2;
      case 3:
        return pair.right_option_3;
      case 4:
        return pair.right_option_4;
      default:
        return '';
    }
  }




}

