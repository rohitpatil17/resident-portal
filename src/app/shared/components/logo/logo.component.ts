// src/app/shared/components/logo/logo.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent {
  /** 'dark' = navy text (login hero bg), 'light' = white text (sidebar) */
  @Input() theme: 'dark' | 'light' = 'dark';
  /** 'lg' for login, 'sm' for sidebar */
  @Input() size: 'lg' | 'sm' = 'lg';
}
