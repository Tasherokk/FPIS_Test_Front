import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-test-summary',
  templateUrl: './test-summary.component.html',
  styleUrl: './test-summary.component.css',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  standalone: true
})
export class TestSummaryComponent implements OnInit {
  @Input() testData: any[] = [];
  @Input() answers: any = {};
  @Input() subjectNames: any = {};
  @Output() onCancel = new EventEmitter<void>();
  @Output() onCompleteTest = new EventEmitter<void>();

  showModal = false;
  showSummary = true;
  mathQuestion: { num1: number, num2: number, answer: string } = { num1: 0, num2: 0, answer: '' };

  ngOnInit() {
    this.showModal = false;
    this.showSummary = true;
  }

  getAnsweredCount(subject: any): number {
    return subject.questions.filter((q: any) => this.isQuestionAnswered(subject.id, q.id, q.question_type)).length;
  }

  getUnansweredCount(subject: any): number {
    return subject.questions.length - this.getAnsweredCount(subject);
  }

  isQuestionAnswered(subjectId: number, questionId: number, questionType: string): boolean {
    const answer = this.answers[subjectId][questionId];
    return questionType === 'SC' ? answer !== null : questionType === 'MC' ? Array.isArray(answer) && answer.length > 0
      : typeof answer === 'object' && Object.keys(answer).length > 1;
  }

  generateMathQuestion() {
    this.mathQuestion.num1 = Math.floor(Math.random() * 10);
    this.mathQuestion.num2 = Math.floor(Math.random() * 10);
    this.mathQuestion.answer = '';
  }

  confirmSummary() {
    this.showSummary = false;
    this.generateMathQuestion();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.showSummary = true;
  }

  cancelSummary() {
    this.onCancel.emit();
  }

  checkAnswer() {
    const correctAnswer = this.mathQuestion.num1 + this.mathQuestion.num2;
    if (parseInt(this.mathQuestion.answer, 10) === correctAnswer) {
      this.onCompleteTest.emit();
      this.showModal = false;
    } else {
      alert('Қате жауап. Қайталап көріңіз.');
      this.generateMathQuestion();
    }
  }
}
