// src/app/pages/account/account.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResidentService } from '../../core/services/resident.service';
import { AccountSection } from '../../core/models/resident.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  sections: AccountSection[] = [];

  constructor(private residentService: ResidentService) {}

  ngOnInit(): void {
    this.residentService.getAccountSections().subscribe(s => this.sections = s);
  }

  viewSection(section: AccountSection): void {
    if (!section.disabled) {
      alert(`Opening: ${section.title}`);
    }
  }
}
