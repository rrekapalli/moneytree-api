import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/security/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    const isLoggedIn = this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const email = this.loginForm.get('email')?.value;

      this.authService.loginWithEmail(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message || 'Login failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please enter a valid email address.';
    }
  }

  signInWithGoogle(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Redirect to backend OAuth2 endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  signInWithMicrosoft(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Redirect to backend OAuth2 endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/microsoft';
  }

  getErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required.';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    return '';
  }
} 