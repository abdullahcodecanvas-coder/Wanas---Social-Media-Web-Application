import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly httpClient = inject(HttpClient);
   header = {
    headers:{
      AUTHORIZATION:`Bearer ${localStorage.getItem("token")}`
    }
   };

  getAllPosts(): Observable<any> {
   return this.httpClient.get(environment.baseUrl +`posts` , this.header);
  }
  getSinglePost(id:string): Observable<any> {
   return this.httpClient.get(environment.baseUrl +`posts/${id}` , this.header);
  }
  deletePost(id:string):Observable<any>{
    return this.httpClient.delete(environment.baseUrl +`posts/${id}` , this.header);
  }
  createPost(body:object):Observable<any>{
    return this.httpClient.post(environment.baseUrl +`posts` , body ,this.header);
  }
  LikePostAndUnLike(id:string):Observable<any>{
    return this.httpClient.put(environment.baseUrl+`posts/${id}/like`,{},this.header)
  }
  BookMark(id:string):Observable<any>{
    return this.httpClient.put(environment.baseUrl+`posts/${id}/bookmark`,{},this.header)
  }
  UpDatePost(id: string, data: FormData | { body?: string; privacy?: string; removeImage?: boolean }): Observable<any> {
  return this.httpClient.put(environment.baseUrl + `posts/${id}`, data, this.header);
}
  sharePost(id: string, body:string ): Observable<any> {
  return this.httpClient.post(environment.baseUrl + `posts/${id}/share`,{body} ,this.header);
}

}
