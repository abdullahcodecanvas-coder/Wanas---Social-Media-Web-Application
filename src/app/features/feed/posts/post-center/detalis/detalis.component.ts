import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../../services/post.service';
import { DatePipe, Location } from '@angular/common';
@Component({
  selector: 'app-detalis',
  imports: [DatePipe],
  templateUrl: './detalis.component.html',
  styleUrl: './detalis.component.css',
})
export class DetalisComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly postService = inject(PostService);
  private readonly location = inject(Location);

  post = signal<SinglePost | null>(null);
  loading = signal<boolean>(true);
  errorMsg = signal<string>('');

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.getSinglePost(id);
    });
  }

  getSinglePost(id: string): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.postService.getSinglePost(id).subscribe({
      next: (res) => {
        this.post.set(res.data.post);
        this.loading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.errorMsg.set('Could not load this post. Please try again.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}
