import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- chat window -->
    <div class="chat-window" [class.open]="isOpen">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">MAI</div>
          <div>
            <div class="chat-name">MAI</div>
            <div class="chat-status">Always here to help</div>
          </div>
        </div>
        <div class="chat-header-actions">
          <button class="clear-btn" *ngIf="messages.length > 0" (click)="clearHistory()" title="Clear chat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
          <button class="close-btn" (click)="toggle()">✕</button>
        </div>
      </div>

      <div class="chat-messages" #messagesContainer>
        <div class="welcome" *ngIf="messages.length === 0">
          <p>Hi{{ firstName ? ' ' + firstName : '' }}! I'm MAI, your resident portal assistant. Ask me anything about your billing, payments, or account.</p>
          <div class="quick-replies">
            <button *ngFor="let q of quickReplies" (click)="sendQuick(q)">{{ q }}</button>
          </div>
        </div>

        <div *ngFor="let msg of messages" class="message" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
          <!-- user messages: plain text -->
          <div class="bubble" *ngIf="msg.role === 'user'">{{ msg.content }}</div>
          <!-- assistant messages: rendered markdown -->
          <div class="bubble md" *ngIf="msg.role === 'assistant'" [innerHTML]="renderMarkdown(msg.content)"></div>
        </div>

        <div class="message assistant" *ngIf="loading">
          <div class="bubble typing"><span></span><span></span><span></span></div>
        </div>
      </div>

      <div class="chat-input-area">
        <input
          #inputEl
          type="text"
          placeholder="Type a message..."
          [(ngModel)]="input"
          (keydown.enter)="send()"
          [disabled]="loading" />
        <button (click)="send()" [disabled]="loading || !input.trim()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- floating bubble -->
    <button class="chat-bubble" (click)="toggle()" [class.open]="isOpen">
      <ng-container *ngIf="!isOpen">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="7" x2="12" y2="4"/>
          <circle cx="12" cy="3.2" r="1" fill="currentColor" stroke="none"/>
          <rect x="3" y="7" width="18" height="13" rx="2.5"/>
          <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/>
          <path d="M9 16.5q3 1.5 6 0" stroke-width="1.6"/>
        </svg>
        <span class="bubble-label">MAI</span>
      </ng-container>
      <svg *ngIf="isOpen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 1000;
    }

    .chat-bubble {
      width: 60px; height: 60px;
      border-radius: 50%;
      background: linear-gradient(145deg, #6B68C0 0%, #5653A1 100%);
      border: none; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
      color: white;
      box-shadow: 0 4px 20px rgba(86,83,161,0.45);
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(86,83,161,0.6); }
    }

    .bubble-label {
      font-size: 8.5px; font-weight: 800;
      letter-spacing: 1.5px;
      opacity: 0.9;
    }

    .chat-window {
      position: absolute;
      bottom: 68px; right: 0;
      width: 340px; height: 480px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(26,35,64,0.18);
      display: flex; flex-direction: column;
      opacity: 0; pointer-events: none;
      transform: translateY(12px) scale(0.97);
      transition: opacity 0.2s, transform 0.2s;
      overflow: hidden;

      &.open {
        opacity: 1; pointer-events: all;
        transform: translateY(0) scale(1);
      }
    }

    .chat-header {
      background: #5653A1;
      padding: 14px 16px;
      display: flex; align-items: center; justify-content: space-between;
    }

    .chat-header-info { display: flex; align-items: center; gap: 10px; }
    .chat-header-actions { display: flex; align-items: center; gap: 4px; }

    .chat-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white;
    }

    .chat-name { font-size: 14px; font-weight: 600; color: white; }
    .chat-status { font-size: 11px; color: rgba(255,255,255,0.7); }

    .close-btn {
      background: none; border: none; color: rgba(255,255,255,0.8);
      cursor: pointer; font-size: 14px; padding: 4px;
      &:hover { color: white; }
    }

    .clear-btn {
      background: none; border: none; color: rgba(255,255,255,0.6);
      cursor: pointer; padding: 4px; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.15s, background 0.15s;
      &:hover { color: white; background: rgba(255,255,255,0.12); }
    }

    .chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .welcome {
      p { font-size: 13px; color: #64748B; line-height: 1.5; margin: 0 0 12px; }
    }

    .quick-replies {
      display: flex; flex-wrap: wrap; gap: 6px;
      button {
        font-size: 11px; padding: 5px 10px;
        border: 1px solid #5653A1; border-radius: 20px;
        background: white; color: #5653A1; cursor: pointer;
        transition: all 0.15s;
        &:hover { background: #5653A1; color: white; }
      }
    }

    .message {
      display: flex;
      &.user { justify-content: flex-end; }
      &.assistant { justify-content: flex-start; }
    }

    .bubble {
      max-width: 78%; padding: 9px 13px;
      border-radius: 16px; font-size: 13px; line-height: 1.5;

      .user & {
        background: #5653A1; color: white;
        border-bottom-right-radius: 4px;
      }
      .assistant & {
        background: #F1F3F9; color: #1a2340;
        border-bottom-left-radius: 4px;
      }
    }

    /* markdown rendering inside assistant bubbles */
    .bubble.md {
      ::ng-deep {
        p { margin: 0 0 6px; &:last-child { margin-bottom: 0; } }
        strong { font-weight: 700; }
        em { font-style: italic; }
        ul { margin: 4px 0 6px; padding-left: 16px; &:last-child { margin-bottom: 0; } }
        li { margin-bottom: 2px; }
        code {
          font-family: 'Courier New', monospace;
          font-size: 11.5px;
          background: rgba(86,83,161,0.1);
          color: #5653A1;
          padding: 1px 5px;
          border-radius: 4px;
        }
      }
    }

    .typing {
      display: flex; align-items: center; gap: 4px; padding: 12px 14px;
      span {
        width: 6px; height: 6px; border-radius: 50%;
        background: #94A3B8; display: inline-block;
        animation: bounce 1.2s infinite;
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    .chat-input-area {
      padding: 12px;
      border-top: 1px solid #E2E6F0;
      display: flex; gap: 8px; align-items: center;

      input {
        flex: 1; padding: 9px 12px;
        border: 1px solid #E2E6F0; border-radius: 10px;
        font-size: 13px; outline: none;
        transition: border-color 0.2s;
        &:focus { border-color: #5653A1; }
        &:disabled { background: #F8F9FC; }
      }

      button {
        width: 36px; height: 36px; flex-shrink: 0;
        background: #5653A1; border: none; border-radius: 10px;
        color: white; cursor: pointer; display: flex;
        align-items: center; justify-content: center;
        transition: background 0.2s;
        &:hover:not(:disabled) { background: #4a4790; }
        &:disabled { opacity: 0.5; cursor: default; }
      }
    }

    @media (max-width: 480px) {
      :host { bottom: 16px; right: 16px; }
      .chat-window { width: calc(100vw - 32px); }
    }
  `]
})
export class ChatbotComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('inputEl') private inputEl!: ElementRef;

  isOpen = false;
  input = '';
  loading = false;
  messages: ChatMessage[] = [];

  quickReplies = [
    'What is my balance?',
    'Show my recent payments',
    'When is my next due date?'
  ];

  constructor(
    private chatService: ChatService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  get firstName(): string {
    return this.auth.currentUser?.name?.split(' ')[0] ?? '';
  }

  private get storageKey(): string {
    return `mai_chat_${this.auth.currentUser?.id ?? 'guest'}`;
  }

  private loadHistory(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) this.messages = JSON.parse(raw);
    } catch (e) {
      this.messages = [];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch (e) { /* storage full or unavailable */ }
  }

  clearHistory(): void {
    this.messages = [];
    localStorage.removeItem(this.storageKey);
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) setTimeout(() => this.scrollToBottom(), 60);
  }

  sendQuick(text: string): void {
    this.input = text;
    this.send();
  }

  send(): void {
    const text = this.input.trim();
    if (!text || this.loading) return;

    this.messages.push({ role: 'user', content: text });
    this.input = '';
    this.loading = true;
    this.scrollToBottom();

    this.chatService.send(text, this.messages.slice(0, -1)).subscribe({
      next: res => {
        this.messages.push({ role: 'assistant', content: res.reply });
        this.loading = false;
        this.saveHistory();
        this.scrollToBottom();
        this.focusInput();
      },
      error: () => {
        this.messages.push({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' });
        this.loading = false;
        this.saveHistory();
        this.scrollToBottom();
        this.focusInput();
      }
    });
  }

  // lightweight markdown → safe HTML
  renderMarkdown(text: string): string {
    let html = text
      // escape any existing HTML to prevent injection
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // bold (**text**)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // italic (*text*)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // bullet lists: consecutive lines starting with "- "
    html = html.replace(/((?:^|\n)- .+)+/g, (block) => {
      const items = block.trim().split('\n').map(line =>
        `<li>${line.replace(/^- /, '')}</li>`
      ).join('');
      return `<ul>${items}</ul>`;
    });

    // double newline → paragraph break, single newline → <br>
    html = html
      .split(/\n{2,}/)
      .map(para => para.trim())
      .filter(Boolean)
      .map(para => para.startsWith('<ul>') ? para : `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');

    return html;
  }

  private focusInput(): void {
    setTimeout(() => this.inputEl?.nativeElement?.focus(), 50);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
