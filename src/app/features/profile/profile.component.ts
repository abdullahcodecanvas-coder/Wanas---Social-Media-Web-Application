import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PostService } from '../feed/posts/services/post.service';
import { ProfileService } from './services/profile-service.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent  {
  private readonly profileService = inject(ProfileService);
  private readonly postService = inject(PostService);
 
  user = this.profileService.user;
  photo = this.profileService.photo;
  hasCustomPhoto = this.profileService.hasCustomPhoto;
 
  saving = signal(false);
  shareToFeed = signal(true);
  message = signal<{ type: 'success' | 'error'; text: string } | null>(null);
 
  // ===== My posts =====
  posts = signal<any[]>([]);
  postsLoading = signal(false);
  postsError = signal(false);
  openMenuId = signal<string | null>(null);
 
  displayName = computed(() => this.user()?.name ?? this.user()?.username ?? 'Wanas user');
  initial = computed(() => this.displayName().charAt(0));
 
  details = computed<DetailRow[]>(() => {
    const u = this.user();
    if (!u) return [];
 
    const rows: DetailRow[] = [];
    if (u.email) rows.push({ icon: 'fa-regular fa-envelope', label: 'Email', value: u.email });
    if (u.username) rows.push({ icon: 'fa-solid fa-at', label: 'Username', value: u.username });
    if (u.gender) rows.push({ icon: 'fa-solid fa-user', label: 'Gender', value: u.gender });
    if (u.dateOfBirth) {
      rows.push({ icon: 'fa-solid fa-cake-candles', label: 'Birthday', value: this.formatDate(u.dateOfBirth) });
    }
    if (u.createdAt) {
      rows.push({ icon: 'fa-regular fa-calendar', label: 'Joined', value: this.formatDate(u.createdAt) });
    }
    return rows;
  });
 
  ngOnInit(): void {
    this.loadPosts();
  }
 
  // قفل قايمة الـ ... لما تضغط في أي مكان تاني
  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuId.set(null);
  }
 
  // ===== Posts =====
 
  loadPosts(): void {
    const myId = this.user()?._id ?? this.user()?.id;
    if (!myId) return;
 
    this.postsLoading.set(true);
    this.postsError.set(false);
 
    this.postService.getAllPosts().subscribe({
      next: (res) => {
        console.log(res); // لو البوستات مش ظاهرة شوف مكان الـ array هنا
        const data = res?.data?.posts ?? res?.posts ?? res?.data ?? [];
        const all: any[] = Array.isArray(data) ? data : [];
 
        // بنفلتر بوستات اليوزر الحالي بس
        this.posts.set(all.filter((p) => (p.user?._id ?? p.user?.id) === myId));
        this.postsLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.postsError.set(true);
        this.postsLoading.set(false);
      },
    });
  }
 
  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === id ? null : id));
  }
 
  likesCount(post: any): number {
    return post.likesCount ?? post.likes?.length ?? 0;
  }
 
  likePost(post: any): void {
    this.postService.LikePostAndUnLike(post._id).subscribe({
      next: () =>
        this.patchPost(post._id, (p) => {
          const liked = !p.isLiked;
          return { ...p, isLiked: liked, likesCount: Math.max(0, this.likesCount(p) + (liked ? 1 : -1)) };
        }),
      error: (err) => console.log(err),
    });
  }
 
  toggleBookmark(post: any): void {
    this.postService.BookMark(post._id).subscribe({
      next: () => this.patchPost(post._id, (p) => ({ ...p, isBookmarked: !p.isBookmarked })),
      error: (err) => console.log(err),
    });
  }
 
  deletePost(id: string): void {
    this.openMenuId.set(null);
    if (!confirm('Delete this post? This cannot be undone.')) return;
 
    this.postService.deletePost(id).subscribe({
      next: () => this.posts.update((list) => list.filter((p) => p._id !== id)),
      error: (err) => {
        console.log(err);
        this.notify('error', "Couldn't delete the post. Try again.");
      },
    });
  }
 
  private patchPost(id: string, change: (p: any) => any): void {
    this.posts.update((list) => list.map((p) => (p._id === id ? change(p) : p)));
  }
 
  timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }
 
  // ===== Photo =====
 
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // عشان تقدر تختار نفس الصورة تاني
 
    if (!file) return;
 
    this.saving.set(true);
    try {
      const dataUrl = await this.profileService.setPhoto(file);
 
      if (!this.shareToFeed()) {
        this.notify('success', 'Profile photo updated.');
        return;
      }
 
      try {
        await this.shareAsPost(dataUrl);
        this.notify('success', 'Profile photo updated and shared to your feed.');
        this.loadPosts(); // عشان البوست الجديد يظهر في القايمة
      } catch (err) {
        console.log(err);
        this.notify('error', "Photo updated, but we couldn't share it to your feed.");
      }
    } catch (err: any) {
      this.notify('error', err?.message ?? 'Something went wrong. Try again.');
    } finally {
      this.saving.set(false);
    }
  }
 
  // بتنزّل بوست بالصورة الجديدة زي الفيس
  private async shareAsPost(dataUrl: string): Promise<void> {
    const blob = await (await fetch(dataUrl)).blob();
 
    const formData = new FormData();
    formData.append('body', 'Updated my profile picture');
    formData.append('image', new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' }));
    formData.append('privacy', 'public');
 
    await firstValueFrom(this.postService.createPost(formData));
  }
 
  removePhoto(): void {
    this.profileService.removePhoto();
    this.notify('success', 'Profile photo removed.');
  }
 
  private notify(type: 'success' | 'error', text: string): void {
    this.message.set({ type, text });
    setTimeout(() => this.message.set(null), 3500);
  }
 
  private formatDate(value: string): string {
    const date = new Date(value);
    return isNaN(date.getTime())
      ? value
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}