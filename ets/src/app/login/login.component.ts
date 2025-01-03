import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], 
  imports: [ReactiveFormsModule, CommonModule], 
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      id_number: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  
  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }
  
    this.authService.login(this.loginForm.value).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          // Redirect directly to dashboard after successful login
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message;
        }
      },
      (error) => {
        this.errorMessage = 'An error occurred. Please try again later.';
      }
    );
  }
}
