import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly httpClient = inject(HttpClient);

  // بيتقرا في كل request عشان ناخد آخر token متخزن
  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  }

  GetNotifications(unread: boolean, page: number, limit: number): Observable<any> {
    const params = new HttpParams()
      .set('unread', unread)
      .set('page', page)
      .set('limit', limit);

    return this.httpClient.get(environment.baseUrl + 'notifications', {
      params,
      headers: this.headers,
    });
  }

  GetUnreadCount(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'notifications/unread-count', {
      headers: this.headers,
    });
  }

  MarkAsRead(id: string): Observable<any> {
    return this.httpClient.patch(
      environment.baseUrl + `notifications/${id}/read`,
      {},
      { headers: this.headers },
    );
  }

  MarkAllAsRead(): Observable<any> {
    return this.httpClient.patch(
      environment.baseUrl + 'notifications/read-all',
      {},
      { headers: this.headers },
    );
  }
}