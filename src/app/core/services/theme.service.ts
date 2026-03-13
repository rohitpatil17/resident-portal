import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private dark = false;

  constructor() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') this.apply(true);
  }

  get isDark(): boolean { return this.dark; }

  toggle(): void { this.apply(!this.dark); }

  private apply(dark: boolean): void {
    this.dark = dark;
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
}
