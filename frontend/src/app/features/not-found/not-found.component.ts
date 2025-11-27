import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4 text-center">
      <h1 class="text-4xl font-bold mb-4">404</h1>
      <p class="text-xl mb-4">Page Not Found</p>
      <p class="mb-4">The page you are looking for does not exist.</p>
      <a routerLink="/" class="text-blue-500 hover:text-blue-600">
        Return to Dashboard
      </a>
    </div>
  `,
  styles: []
})
export class NotFoundComponent {
  constructor() {}
} 