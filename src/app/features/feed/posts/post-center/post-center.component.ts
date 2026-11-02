import { Component, computed, HostListener, inject, Input, OnInit, signal } from '@angular/core';
import { PostService } from '../services/post.service';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommentsComponent } from './comments/comments.component';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../profile/services/profile-service.service'; // عدّل المسار
import { SearchService } from '../../../../layout/main-layout/services/seacrch.service';

@Component({
  selector: 'app-post-center',
  imports: [DatePipe, ReactiveFormsModule, CommentsComponent, RouterLink],
  templateUrl: './post-center.component.html',
  styleUrl: './post-center.component.css',
})
export class PostCenterComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly profileService = inject(ProfileService);

  content = new FormControl('', [Validators.required]);
  privacy = new FormControl('public');

  user = this.profileService.user;
  avatar = this.profileService.avatar; // صورة اليوزر المحدثة أو الافتراضية

  idUser = computed(() => this.user()?._id ?? this.user()?.id ?? '');

  placeholder = computed(() => {
    const first = (this.user()?.name ?? this.user()?.username ?? '').split(' ')[0];
    return first ? `What's on your mind, ${first}?` : "What's on your mind?";
  });

  allPosts = signal<GetAllPost[]>([]);
  file = signal<File | null>(null);
  img = signal('');

  ngOnInit(): void {
    this.getAllPosts();
  }

  // ===== Create + Update في هاندلر واحد =====
  postSend(e: SubmitEvent): void {
    e.preventDefault();

    const text = this.content.value?.trim();
    const file = this.file();
    const editId = this.editingPostId();

    // في التعديل الصورة القديمة (img) بتتحسب كمان
    const hasImage = !!file || (!!editId && !!this.img());

    if (!text && !hasImage) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops!',
        text: 'Please write something or add a photo before posting.',
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#F97316',
        background: '#FFF8F1',
        color: '#44403C',
      });
      return;
    }

    const formData = new FormData();
    if (text) formData.append('body', text);
    if (file) formData.append('image', file);
    if (this.privacy.value) formData.append('privacy', this.privacy.value);

    if (editId) {
      // لو كان فيه صورة وشالها المستخدم
      if (this.hadImage && !this.img() && !file) {
        formData.append('removeImage', 'true');
      }

      this.postService.UpDatePost(editId, formData).subscribe({
        next: () => {
          this.getAllPosts();
          this.resetForm();
        },
        error: (err) => {
          console.log(err);
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Could not update the post. Please try again.',
            confirmButtonColor: '#E75F0F',
          });
        },
      });
      return;
    }

    this.postService.createPost(formData).subscribe({
      next: (res) => {
        console.log(res);
        this.getAllPosts();
        this.resetForm();
      },
      error: (err) => console.log(err),
    });
  }

  isSelected(post: GetAllPost, value: string) {
    return post.privacy === value;
  }

  getAllPosts(): void {
    this.postService.getAllPosts().subscribe({
      next: (res) => {
        console.log(res.data.posts);
        this.allPosts.set(res.data.posts);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  changePhoto(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.file.set(input.files[0]);
      this.img.set(URL.createObjectURL(input.files[0]));
    }
  }

  removePhoto() {
    this.img.set('');
    this.file.set(null);
  }

  timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  openMenuId = signal<string | null>(null);

  toggleMenu(id: string) {
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  closeMenu() {
    this.openMenuId.set(null);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeMenu();
  }

  deletePost(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this post!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E75F0F',
      cancelButtonColor: '#78716C',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#FFF8F1',
      color: '#44403C',
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService.deletePost(id).subscribe({
          next: (res) => {
            if (res.success) {
              this.getAllPosts();

              Swal.fire({
                title: 'Deleted!',
                text: 'Your post has been deleted successfully.',
                icon: 'success',
                confirmButtonColor: '#E75F0F',
                background: '#FFF8F1',
                color: '#44403C',
              });
            }
          },
          error: () => {
            Swal.fire({
              title: 'Oops!',
              text: 'Something went wrong. Please try again.',
              icon: 'error',
              confirmButtonColor: '#E75F0F',
            });
          },
        });
      }
    });
  }

  likePost(post: any): void {
    this.postService.LikePostAndUnLike(post._id).subscribe({
      next: (res) => {
        this.playSound(res.data.liked);
        this.allPosts.update((posts) =>
          posts.map((p) =>
            p._id === post._id
              ? { ...p, likesCount: res.data.likesCount, isLiked: res.data.liked }
              : p,
          ),
        );
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private likeSound = new Audio('sound/like.mp3');
  private unlikeSound = new Audio('sound/unlike.mp3');

  private playSound(liked: boolean): void {
    const sound = liked ? this.likeSound : this.unlikeSound;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  /* ===== Edit Post ===== */
  editingPostId = signal<string | null>(null);
  private hadImage = false; // هل البوست كان فيه صورة قبل التعديل

  startEdit(post: GetAllPost): void {
    this.editingPostId.set(post._id);
    this.content.setValue(post.body ?? '');
    this.privacy.setValue(post.privacy ?? 'public');
    this.file.set(null);
    this.img.set(post.image ?? '');
    this.hadImage = !!post.image;
    this.closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingPostId.set(null);
    this.hadImage = false;
    this.content.reset('');
    this.file.set(null);
    this.img.set('');
    this.privacy.setValue('public');
  }

  /* ===== Bookmark ===== */
  private bookmarkSound = new Audio('sound/bookmark.mp3');
 toogleBookMark(post: any): void {
  this.postService.BookMark(post._id).subscribe({
    next: (res: any) => {

      this.allPosts.update(posts =>
        posts.map(p =>
          p._id === post._id
            ? { ...p, bookmarked: res.data.bookmarked }
            : p
        )
      );

      if (res.data.bookmarked) {
        this.bookmarkSound.currentTime = 0;
        this.bookmarkSound.play().catch(() => {});
      }
    },
    error: (err: any) => console.log(err)
  });
}
  /* ===== Share ===== */
  sharePost(post: any): void {
    Swal.fire({
      title: 'Share this post',
      input: 'textarea',
      inputPlaceholder: 'Say something about this post... (optional)',
      inputAttributes: { 'aria-label': 'Share comment' },
      showCancelButton: true,
      confirmButtonText: 'Share',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#E75F0F',
      cancelButtonColor: '#78716C',
      background: '#FFF8F1',
      color: '#44403C',
    }).then((result) => {
      // المستخدم داس Cancel أو قفل الـ alert
      if (!result.isConfirmed) return;

      const text = (result.value as string)?.trim() || 'Sharing this great post';

      this.postService.sharePost(post._id, text).subscribe({
        next: () => {
          this.getAllPosts();

          Swal.fire({
            icon: 'success',
            title: 'Shared!',
            text: 'The post has been shared successfully.',
            confirmButtonColor: '#E75F0F',
            background: '#FFF8F1',
            color: '#44403C',
            timer: 1800,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Could not share the post. Please try again.',
            confirmButtonColor: '#E75F0F',
            background: '#FFF8F1',
            color: '#44403C',
          });
        },
      });
    });
  }

private readonly searchService = inject(SearchService);

get filteredPosts() {
  const term = this.searchService.searchTerm();

  if (!term) {
    return this.allPosts();
  }

  return this.allPosts().filter((post: any) =>
    post.user?.name?.toLowerCase().includes(term)
  );
}

}