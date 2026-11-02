import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly httpClient = inject(HttpClient);
   header = {
    headers:{
      AUTHORIZATION:`Bearer ${localStorage.getItem("token")}`
    }
   };
  getAllComment(id:string, number:Number ):Observable<any>{
    return this.httpClient.get( environment.baseUrl +`posts/${id}/comments?page=1&limit=${number}`,
      this.header)
  }
  createComment(id:string , data: FormData):Observable<any>{
  return this.httpClient.post( environment.baseUrl +`posts/${id}/comments`,data, 
      this.header
    )
  }
  getAllCommentReply(id:string, number:Number , commentId:string ):Observable<any>{
    return this.httpClient.get( environment.baseUrl +`posts/${id}/comments/${commentId}/replies?page=1&limit=${number}`,
      this.header)
  }
 likeandUnLikeComment(id:string,comment:string):Observable<any>{
  return this.httpClient.put(environment.baseUrl +`posts/${id}/comments/${comment}/like` ,{} ,this.header)
 }
 createReply(postId: string, commentId: string, body: FormData): Observable<any> {
  return this.httpClient.post(
    environment.baseUrl + `posts/${postId}/comments/${commentId}/replies`,
    body,
    this.header
  );
}
DeleteComment(postId: string, commentId: string): Observable<any> {
  return this.httpClient.delete(
    environment.baseUrl + `posts/${postId}/comments/${commentId}`,
    this.header
  );
}
UpdateComment(postId: string, commentId: string, body: FormData): Observable<any> {
  return this.httpClient.put(
    environment.baseUrl + `posts/${postId}/comments/${commentId}`,
    body,
    this.header
  );
}
}
