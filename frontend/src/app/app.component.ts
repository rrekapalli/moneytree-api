import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebSocketNavigationService } from './services/websockets/websocket-navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  template: '<router-outlet></router-outlet>',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(private webSocketNavigationService: WebSocketNavigationService) {}

  ngOnInit(): void {
    // The WebSocketNavigationService is injected here to ensure it's initialized
    // and starts tracking navigation events for WebSocket cleanup
  }
}
