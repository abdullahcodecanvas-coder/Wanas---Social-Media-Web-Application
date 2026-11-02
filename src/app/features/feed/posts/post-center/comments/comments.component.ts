import { Component, computed, ElementRef, inject, input, OnInit, signal,
         AfterViewInit, OnDestroy, output, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { CommentService } from '../../services/comment.service';
import { ReplyComment } from '../../interface/reply-comment.interface';
import { CommentItem } from '../../interface/comment-item.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-comments',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements AfterViewInit, OnDestroy, OnInit {
  private readonly commentService = inject(CommentService);

  id = input.required<string>();
  closed = output<void>();
  dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  // ---------- User ----------
  private readonly user = this.readUser();
  private readonly userId: string = this.user?._id ?? '';
  imgUser: string = this.user?.photo ?? '';

  private readUser() {
    try { return JSON.parse(localStorage.getItem('user') ?? 'null'); }
    catch { return null; }
  }

  // ---------- Dialog ----------
  ngAfterViewInit() { this.dlg().nativeElement.showModal(); }
  close() { this.dlg().nativeElement.close(); }
  onClosed() { this.closed.emit(); }
  onDialogClick(e: MouseEvent) {
    if (e.target === this.dlg().nativeElement) this.close();
  }
  ngOnDestroy() {
    document.body.style.overflow = '';
    this.clearPreview();
    this.audioCtx?.close();
  }

  // ---------- Comments ----------
  AllComment = signal<CommentItem[]>([]);
  totalReplies = computed(() =>
    this.AllComment().reduce((sum, c) => sum + c.repliesCount, 0)
  );

  ngOnInit(): void { this.getComment(); }

  getComment(): void {
    this.commentService.getAllComment(this.id(), 10).subscribe({
      next: (res) => this.AllComment.set(res.data.comments),
      error: (err) => console.log(err),
    });
  }

  // ---------- Like ----------
  private liking = new Set<string>();
  private audioCtx?: AudioContext;

  isLiked(c: CommentItem): boolean {
    return c.likes.includes(this.userId);
  }

  toggleLike(comment: CommentItem): void {
    if (this.liking.has(comment._id)) return;   // يمنع الضغط المتكرر
    this.liking.add(comment._id);

    const wasLiked = this.isLiked(comment);
    const previous = comment.likes;
    const next = wasLiked
      ? previous.filter((u) => u !== this.userId)
      : [...previous, this.userId];

    this.setLikes(comment._id, next);          // تحديث فوري
    if (!wasLiked) this.playLikeSound();

    this.commentService.likeandUnLikeComment(this.id(), comment._id).subscribe({
      next: () => this.liking.delete(comment._id),
      error: (err) => {
        this.liking.delete(comment._id);
        this.setLikes(comment._id, previous);  // رجّع لو فشل
        this.alert({ icon: 'error', title: 'Failed', text: err.error?.message || 'Could not update like' });
      },
    });
  }

  private setLikes(commentId: string, likes: string[]) {
    this.AllComment.update((list) =>
      list.map((c) => (c._id === commentId ? { ...c, likes } : c))
    );
  }

  private playLikeSound(): void {
    try {
      this.audioCtx ??= new AudioContext();
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1000, t + 0.1);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch { /* الصوت مش حاجة حرجة */ }
  }

  // ---------- Create comment / reply ----------
  content = new FormControl('', [Validators.maxLength(300)]);
  fileImg = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  private alert(options: SweetAlertOptions) {
    return Swal.fire({ ...options, target: this.dlg().nativeElement });
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    this.clearPreview();
    this.fileImg.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
    input.value = '';
  }

  removeImage() {
    this.clearPreview();
    this.fileImg.set(null);
  }

  private clearPreview() {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set(null);
  }

 sumbitComment(e: SubmitEvent): void {
  e.preventDefault();

  const text = this.content.value?.trim();
  const file = this.fileImg();
  const editing = this.editingComment();

  if (!text && !file && !editing?.image) {
    this.alert({ icon: 'warning', title: 'Empty comment', text: 'Write something or add an image first.' });
    return;
  }
  if (this.content.invalid) {
    this.alert({ icon: 'error', title: 'Too long', text: 'Comment must be 300 characters or less.' });
    return;
  }

  const formdata = new FormData();
  if (text) formdata.append('content', text);
  if (file) formdata.append('image', file);

  // ---------- Update ----------
  if (editing) {
    this.commentService.UpdateComment(this.id(), editing._id, formdata).subscribe({
      next: () => {
        this.cancelEdit();
        this.getComment();
        this.alert({ icon: 'success', title: 'Comment updated', timer: 1500, showConfirmButton: false });
      },
      error: (err: HttpErrorResponse) => {
        this.alert({ icon: 'error', title: 'Failed', text: err.error?.message || 'Could not update the comment' });
      },
    });
    return;
  }

  // ---------- Create comment / reply ----------
  const target = this.replyingTo();
  const request$ = target
    ? this.commentService.createReply(this.id(), target._id, formdata)
    : this.commentService.createComment(this.id(), formdata);

  request$.subscribe({
    next: () => {
      this.content.reset('');
      this.removeImage();
      this.cancelReply();
      if (target) {
        this.replies.update((r) => { const { [target._id]: _, ...rest } = r; return rest; });
        this.openReplyThread(target._id);
      }
      this.getComment();
      this.alert({ icon: 'success', title: target ? 'Reply added' : 'Comment added', timer: 1500, showConfirmButton: false });
    },
    error: (err: HttpErrorResponse) => {
      this.alert({ icon: 'error', title: 'Failed', text: err.error?.message || 'Something went wrong' });
    },
  });
}

  // ---------- Replies ----------
  replies = signal<Record<string, ReplyComment[]>>({});
  openReplies = signal<Set<string>>(new Set());
  loadingReplies = signal<string | null>(null);
  replyingTo = signal<CommentItem | null>(null);

  toggleReplies(comment: CommentItem): void {
    const open = new Set(this.openReplies());
    if (open.has(comment._id)) {
      open.delete(comment._id);
      this.openReplies.set(open);
      return;
    }
    this.openReplyThread(comment._id);
  }

  private openReplyThread(commentId: string): void {
    const open = new Set(this.openReplies());
    open.add(commentId);
    this.openReplies.set(open);
    if (!this.replies()[commentId]) this.loadReplies(commentId);
  }

  private loadReplies(commentId: string): void {
    this.loadingReplies.set(commentId);
    this.commentService.getAllCommentReply(this.id(), 10, commentId).subscribe({
      next: (res) => {
        this.replies.update((r) => ({ ...r, [commentId]: res.data.replies }));
        this.loadingReplies.set(null);
      },
      error: (err) => {
        console.log(err);
        this.loadingReplies.set(null);
      },
    });
  }
startReply(comment: CommentItem): void {
  this.cancelEdit();
  this.replyingTo.set(comment);
  this.content.setValue(`@${comment.commentCreator.username} `);
}

  cancelReply(): void {
    this.replyingTo.set(null);
    this.content.reset('');
  }


  // ---------- Delete ----------
private deleting = new Set<string>();

isMine(c: CommentItem): boolean {
  return !!this.userId && c.commentCreator._id === this.userId;
}

async deleteComment(comment: CommentItem): Promise<void> {
  if (this.deleting.has(comment._id)) return;

  const result = await this.alert({
    icon: 'warning',
    title: 'Delete comment?',
    text: "You won't be able to undo this.",
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#e11d48',
  });
  if (!result.isConfirmed) return;

  this.deleting.add(comment._id);

  this.commentService.DeleteComment(this.id(), comment._id).subscribe({
    next: () => {
      this.deleting.delete(comment._id);

      // شيل الكومنت من الليست
      this.AllComment.update((list) => list.filter((c) => c._id !== comment._id));
       
      // نضّف الردود المفتوحة بتاعته
      this.replies.update((r) => {
        const { [comment._id]: _, ...rest } = r;
        return rest;
      });
      this.openReplies.update((s) => {
        const next = new Set(s);
        next.delete(comment._id);
        return next;
      });

      // لو كنت بترد عليه، الغي الرد
      if (this.replyingTo()?._id === comment._id) this.cancelReply();

      this.alert({
        icon: 'success',
        title: 'Comment deleted',
        timer: 1500,
        showConfirmButton: false,
      });
    },
    error: (err: HttpErrorResponse) => {
      this.deleting.delete(comment._id);
      this.alert({
        icon: 'error',
        title: 'Failed',
        text: err.error?.message || 'Could not delete the comment',
      });
    },
  });
}
editingComment = signal<CommentItem | null>(null);

startEdit(comment: CommentItem): void {
  this.cancelReply();
  this.removeImage();
  this.editingComment.set(comment);
  this.content.setValue(comment.content ?? '');
}

cancelEdit(): void {
  this.editingComment.set(null);
  this.removeImage();
  this.content.reset('');
}
}