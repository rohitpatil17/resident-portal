import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:12px;color:#6b7280;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <h2 style="margin:0;font-size:1.25rem;color:#374151;">Coming Soon</h2>
      <p style="margin:0;font-size:0.9rem;">This feature is under development.</p>
    </div>
  `
})
export class ComingSoonComponent {}
