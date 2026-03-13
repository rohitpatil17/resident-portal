// src/app/layout/app-layout.component.ts

import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../shared/components/topbar/topbar.component';
import { ChatbotComponent } from '../shared/components/chatbot/chatbot.component';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, ChatbotComponent],
  template: `
    <!-- Mobile overlay -->
    <div class="sidebar-overlay" [class.visible]="sidebarOpen" (click)="closeSidebar()"></div>

    <div class="app-shell">
      <!-- Sidebar with open class for mobile -->
      <app-sidebar [class.open]="sidebarOpen" (closeSidebar)="closeSidebar()"></app-sidebar>

      <div class="main-content">
        <!-- Topbar with hamburger -->
        <header class="topbar">
          <div class="topbar-left">
            <!-- Hamburger — mobile only -->
            <button class="hamburger" (click)="toggleSidebar()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div class="topbar-title">{{ pageTitle }}</div>
          </div>
          <div class="topbar-right">
            <span class="topbar-date">{{ today }}</span>
            <button class="theme-btn" (click)="theme.toggle()" [title]="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
              <!-- moon -->
              <svg *ngIf="!theme.isDark" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              <!-- sun -->
              <svg *ngIf="theme.isDark" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </button>
            <button class="notif-btn">
              <div class="notif-dot"></div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
          </div>
        </header>

        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>

    <app-chatbot></app-chatbot>
  `,
  styles: [`
    .sidebar-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 99;
      opacity: 0; transition: opacity 0.3s;
    }

    .app-shell { display: flex; width: 100%; min-height: 100vh; }

    .main-content {
      margin-left: 256px;
      flex: 1; display: flex; flex-direction: column;
      min-width: 0;
      transition: margin-left 0.3s;
      background: var(--gray-50);
    }

    .topbar {
      height: 64px; background: white;
      border-bottom: 1px solid #E2E6F0;
      padding: 0 28px;
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 50;
      box-shadow: 0 1px 4px rgba(26,35,64,0.08);
    }

    .topbar-left { display: flex; align-items: center; gap: 14px; }
    .topbar-title { font-size: 17px; font-weight: 700; color: #1a2340; letter-spacing: -0.3px; }
    .topbar-right { display: flex; align-items: center; gap: 14px; }
    .topbar-date  { font-size: 12px; color: #94A3B8; }

    .hamburger {
      display: none;
      background: none; border: none; cursor: pointer;
      color: #1a2340; padding: 4px;
      align-items: center; justify-content: center;
      border-radius: 8px; transition: background 0.2s;
      &:hover { background: #F0F2F8; }
    }

    .theme-btn {
      width: 36px; height: 36px; border-radius: 10px;
      border: 2px solid #E2E6F0; background: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #94A3B8; transition: all .2s;
      &:hover { border-color: #7B7FC4; color: #7B7FC4; }
    }

    .notif-btn {
      width: 36px; height: 36px; border-radius: 10px;
      border: 2px solid #E2E6F0; background: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #94A3B8; position: relative; transition: all .2s;
      &:hover { border-color: #7B7FC4; color: #7B7FC4; }
    }

    .notif-dot {
      position: absolute; top: 5px; right: 5px;
      width: 7px; height: 7px; border-radius: 50%;
      background: #E8343A; border: 2px solid white;
    }

    .content-area { padding: 26px 28px; flex: 1; }

    /* ── RESPONSIVE ── */
    @media (max-width: 768px) {
      .sidebar-overlay { display: block; }
      .sidebar-overlay.visible { opacity: 1; pointer-events: all; }

      .main-content { margin-left: 0; }

      .hamburger { display: flex; }

      .topbar { padding: 0 16px; }
      .topbar-date { display: none; }

      .content-area { padding: 16px; }
    }

    @media (max-width: 480px) {
      .topbar-title { font-size: 15px; }
      .content-area { padding: 12px; }
    }
  `]
})
export class AppLayoutComponent {
  pageTitle = 'Dashboard';
  sidebarOpen = false;
  today = new Intl.DateTimeFormat('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).format(new Date());

  private titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/payment':   'Make a Payment',
    '/billing':   'E-Billing and Payment History',
    '/account':   'My Account',
    '/documents': 'Documents',
    '/faq':       'FAQ',
  };

  constructor(private router: Router, public theme: ThemeService) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: any) => this.titleMap[e.urlAfterRedirects] || 'Dashboard')
    ).subscribe(title => {
      this.pageTitle = title;
      this.sidebarOpen = false; // close sidebar on route change
    });
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void  { this.sidebarOpen = false; }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) this.sidebarOpen = false;
  }
}
