// src/app/shared/components/sidebar/sidebar.component.ts

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input()  isOpen        = false;   // controlled by parent via [isOpen]
  @Input()  hasDueBalance = false;   // parent passes true when totalDue > 0
  @Output() closeSidebar  = new EventEmitter<void>();

  resident$ = this.auth.currentUser$;

  mainNav: NavItem[] = [
    { label: 'Dashboard',           route: '/dashboard', icon: 'grid'  },
    { label: 'Make a Payment',      route: '/payment',   icon: 'card'  },
    { label: 'E-Billing & History', route: '/billing',   icon: 'clock' },
    { label: 'My Account',          route: '/account',   icon: 'user'  },
  ];

  resourceNav: NavItem[] = [
    { label: 'Documents', route: '/documents', icon: 'file' },
    { label: 'FAQ',       route: '/faq',       icon: 'info' },
  ];

  constructor(private auth: AuthService) {}

  logout(): void { this.auth.logout(); }
  close():  void { this.closeSidebar.emit(); }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      grid:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
      card:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>`,
      clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>`,
      user:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
      file:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      info:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
    };
    return icons[name] || '';
  }
}