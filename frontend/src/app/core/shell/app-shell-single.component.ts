import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AppHeaderComponent } from '../header/app-header.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell-single',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AppHeaderComponent,
    ProgressSpinnerModule,
    ToastModule
  ],
  templateUrl: './app-shell-single.component.html',
  styleUrl: './app-shell-single.component.scss',
  providers: [MessageService]
})
export class AppShellSingleComponent implements OnInit, OnDestroy {
  loading = false; // This will be used to control the loading spinner visibility
  private toastSubscription: Subscription | undefined;

  constructor(
    private messageService: MessageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.toastSubscription = this.toastService.toast$.subscribe(toast => {
      this.messageService.add(toast);
    });
  }

  ngOnDestroy(): void {
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
  }

  onRouterOutletActivate(component: any): void {
    // Router outlet activation - no manual cleanup needed
  }

  onRouterOutletDeactivate(component: any): void {
    // Router outlet deactivation - no manual cleanup needed
  }
}
