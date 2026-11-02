import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NotificationItem } from './interface/notification.interface';
import { NotificationService } from './services/notification.service';
 
type Filter = 'all' | 'unread';


@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent  implements OnInit {
  private readonly notificationsService = inject(NotificationService);
 
  private readonly limit = 10;
  private page = 1;
  private requestId = 0; // عشان نتجاهل أي response قديم لو غيرت الـ tab بسرعة
 
  notifications = signal<NotificationItem[]>([]);
  filter = signal<Filter>('all');
  loading = signal(false);
  loadingMore = signal(false);
  error = signal(false);
  hasMore = signal(false);
  unreadCount = signal(0);
 
  ngOnInit(): void {
    this.load(true);
    this.loadUnreadCount();
  }
 
  private loadUnreadCount(): void {
    this.notificationsService.GetUnreadCount().subscribe({
      next: (res) => {
        const count =
          res?.data?.unreadCount ?? res?.data?.count ?? res?.unreadCount ?? res?.count ?? 0;
        this.unreadCount.set(Number(count));
      },
      error: (err) => console.log(err),
    });
  }
 
  setFilter(value: Filter): void {
    if (this.filter() === value) return;
    this.filter.set(value);
    this.load(true);
  }
 
  loadMore(): void {
    this.page++;
    this.load(false);
  }
 
  retry(): void {
    this.load(true);
  }
 
  private load(reset: boolean): void {
    const currentRequest = ++this.requestId;
 
    if (reset) {
      this.page = 1;
      this.loading.set(true);
      this.notifications.set([]);
      this.hasMore.set(false);
    } else {
      this.loadingMore.set(true);
    }
    this.error.set(false);
 
    this.notificationsService
      .GetNotifications(this.filter() === 'unread', this.page, this.limit)
      .subscribe({
        next: (res) => {
          if (currentRequest !== this.requestId) return; // response قديم
 
          console.log(res); // شوف شكل الـ response وعدّل الـ map() لو لزم
          const data = res?.data?.notifications ?? res?.notifications ?? res?.data ?? [];
          const raw: any[] = Array.isArray(data) ? data : [];
          const mapped = raw.map((n) => this.map(n));
 
          this.notifications.update((list) => (reset ? mapped : [...list, ...mapped]));
          this.hasMore.set(mapped.length === this.limit);
          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: (err) => {
          if (currentRequest !== this.requestId) return;
 
          console.log(err);
          if (!reset) this.page--;
          // لو فشل Load more نسيب القايمة زي ما هي بدل ما نخفيها
          if (reset) this.error.set(true);
          this.loading.set(false);
          this.loadingMore.set(false);
        },
      });
  }
 
  markAsRead(item: NotificationItem): void {
    if (item.isRead) return;
 
    this.notificationsService.MarkAsRead(item.id).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
        this.unreadCount.update((c) => Math.max(0, c - 1));
      },
      error: (err) => console.log(err),
    });
  }
 
  markAllAsRead(): void {
    if (this.unreadCount() === 0) return;
 
    this.notificationsService.MarkAllAsRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      },
      error: (err) => console.log(err),
    });
  }
 
  // ===== helpers =====
 
  private map(n: any): NotificationItem {
    const actor = n.actor ?? n.sender ?? n.user ?? {};
    return {
      id: n._id ?? n.id,
      actorName: actor.name ?? actor.username ?? 'Someone',
      actorPhoto: actor.photo ?? null,
      text: this.describe(n),
      createdAt: n.createdAt,
      isRead: !!(n.isRead ?? n.read),
    };
  }
 
  private describe(n: any): string {
    const map: Record<string, string> = {
      like_post: 'liked your post',
      comment_post: 'commented on your post',
      reply_comment: 'replied to your comment',
      like_comment: 'liked your comment',
      share_post: 'shared your post',
      follow_user: 'started following you',
    };
    return map[n.type] ?? n.message ?? 'sent you a notification';
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
}
 