import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private url = `${environment.apiUrl}/api/chat`;

  constructor(private http: HttpClient) {}

  send(message: string, history: ChatMessage[]): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(this.url, { message, history });
  }
}
