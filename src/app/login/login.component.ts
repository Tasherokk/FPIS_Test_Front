// login.component.ts

import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  iin: string | undefined = '';

  submitted = false;
  loginError = false;
  isLoading = false;

  constructor(private apiService: ApiService, private router: Router) {
    if(sessionStorage.getItem('user') && sessionStorage.getItem('token')) {
      this.router.navigate(['/select']);
    }
  }

  login() {
    this.submitted = true;
    if (this.isIinValid()) {

      this.isLoading = true;
      this.apiService.login(this.iin, this.iin).subscribe(
        (response: { token: string; user_id: any; iin: any; full_name: any }) => {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('user', JSON.stringify({
            id: response.user_id,
            iin: response.iin,
            full_name: response.full_name
          }));
          sessionStorage.setItem('full_name', response.full_name);
          this.isLoading = false;
          this.router.navigate(['/select']);
        },
        (error: any) => {
          this.isLoading = false;
          this.loginError = true;
        }
      );
    }
  }

  isIinValid(): boolean {
    const iinPattern = /^\d{12}$/;
    return iinPattern.test(<string>this.iin);
  }

  clearErrors() {
    this.loginError = false;
    this.submitted = false;
  }


}
