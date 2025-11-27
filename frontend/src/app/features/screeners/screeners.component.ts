import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-screeners',
  standalone: true,
  imports: [
    CommonModule, RouterModule
  ],
  templateUrl: './screeners.component.html',
  styleUrl: './screeners.component.scss'
})
export class ScreenersComponent implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  ngOnInit() {
    // Redirect to list view if on base screeners route
    if (this.router.url === '/screeners') {
      this.router.navigate(['/screeners/list']);
    }
  }

  ngOnDestroy() {
    // No cleanup needed for routing component
  }
}