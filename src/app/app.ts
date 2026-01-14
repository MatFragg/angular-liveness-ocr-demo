import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStateService } from '@core/services/app-state.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App implements OnInit {
  protected readonly title = signal('Identity Verification System');

  constructor(public appState: AppStateService) {}

  ngOnInit(): void {
    // Check for page refresh and reset state if needed
    this.detectPageRefresh();
  }

  private detectPageRefresh(): void {
    const previousSessionKey = sessionStorage.getItem('previousSessionKey');
    const currentSessionKey = sessionStorage.getItem('appSessionKey');
    
    if (previousSessionKey && previousSessionKey !== currentSessionKey) {
      console.log('🔄 Refresh detectado - Reseteando estado');
      this.appState.resetToStart();
    }
    
    sessionStorage.setItem('previousSessionKey', currentSessionKey || '');
  }
}
