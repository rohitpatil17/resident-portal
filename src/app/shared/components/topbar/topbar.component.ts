// src/app/shared/components/topbar/topbar.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar-title">{{ title }}</div>
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
  `,
  styles: [`
    .topbar {
      height: 64px;
      background: var(--white);
      border-bottom: 1px solid var(--gray-200);
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: var(--shadow-sm);
    }
    .topbar-title { font-size: 17px; font-weight: 700; color: var(--navy); letter-spacing: -0.3px; }
    .topbar-right { display: flex; align-items: center; gap: 14px; }
    .topbar-date  { font-size: 12px; color: var(--gray-400); }
    .notif-btn {
      width: 36px; height: 36px;
      border-radius: 10px;
      border: 2px solid var(--gray-200);
      background: var(--white);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--gray-400);
      position: relative;
      transition: all 0.2s;
      &:hover { border-color: var(--purple); color: var(--purple); }
    }
    .notif-dot {
      position: absolute; top: 5px; right: 5px;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--accent);
      border: 2px solid white;
    }
  `]
})
export class TopbarComponent {
  @Input() title = 'Dashboard';
  today = new Intl.DateTimeFormat('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).format(new Date());
}
