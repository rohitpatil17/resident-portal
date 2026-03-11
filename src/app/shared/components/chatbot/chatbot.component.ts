import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';

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
        <button class="close-btn" (click)="toggle()">✕</button>
      </div>

      <div class="chat-messages" #messagesContainer>
        <div class="welcome" *ngIf="messages.length === 0">
          <p>Hi! I'm your resident portal assistant. Ask me anything about your billing, payments, or account.</p>
          <div class="quick-replies">
            <button *ngFor="let q of quickReplies" (click)="sendQuick(q)">{{ q }}</button>
          </div>
        </div>

        <div *ngFor="let msg of messages" class="message" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
          <div class="bubble">{{ msg.content }}</div>
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
      <svg *ngIf="!isOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg *ngIf="isOpen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
      width: 54px; height: 54px;
      border-radius: 50%;
      background: #5653A1;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: white;
      box-shadow: 0 4px 16px rgba(86,83,161,0.4);
      transition: transform 0.2s, background 0.2s;
      &:hover { transform: scale(1.08); background: #4a4790; }
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
      border-radius: 16px; font-size: 13px; line-height: 1.45;

      .user & {
        background: #5653A1; color: white;
        border-bottom-right-radius: 4px;
      }
      .assistant & {
        background: #F1F3F9; color: #1a2340;
        border-bottom-left-radius: 4px;
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
export class ChatbotComponent {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  input = '';
  loading = false;
  messages: ChatMessage[] = [];

  quickReplies = [
    'What is my balance?',
    'Show my recent payments',
    'When is my next due date?'
  ];

  constructor(private chatService: ChatService) {}

  toggle(): void {
    this.isOpen = !this.isOpen;
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
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' });
        this.loading = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
