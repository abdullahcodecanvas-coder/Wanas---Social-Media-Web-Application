import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  sinUp(data:object):Observable<any>{
    return this.httpClient.post( environment.baseUrl + 'users/signup', data )
  }
  sinIn(data:object):Observable<any>{
    return this.httpClient.post( environment.baseUrl + 'users/signin', data )
  }
   
  logout(): void {
   localStorage.removeItem('token');
        
  localStorage.removeItem('user');

   this.router.navigate(['./login'])
  }
}
