import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development'; // عدّل المسار

@Injectable({ providedIn: 'root' })
export class ChangePasswordService {
  private readonly httpClient = inject(HttpClient);

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  }

  // PATCH /users/change-password
  ChangePassword(body: { password: string; newPassword: string }): Observable<any> {
    return this.httpClient.patch(environment.baseUrl + 'users/change-password', body, {
      headers: this.headers,
    });
  }
}