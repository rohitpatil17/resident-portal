// src/app/layout/app-layout.component.ts

import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
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

  constructor(private router: Router) {
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
