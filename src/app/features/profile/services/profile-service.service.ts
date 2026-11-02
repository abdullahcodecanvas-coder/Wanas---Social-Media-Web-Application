import { computed, Injectable, signal } from '@angular/core';

// لو الـ user عندك متخزن باسم تاني في localStorage غيّر الاسم هنا بس
const USER_KEY = 'user';
const PHOTO_KEY = 'wanas_profile_photo';

export interface StoredUser {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  photo?: string;
  gender?: string;
  dateOfBirth?: string;
  createdAt?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly user = signal<StoredUser | null>(this.readUser());

  // الصورة اللي اليوزر اختارها (لو موجودة)
  private readonly customPhoto = signal<string | null>(this.readCustomPhoto());

  // الصورة اللي تتعرض: المخصصة الأول، وبعدها صورة الـ user الأصلية
  readonly photo = computed(() => this.customPhoto() ?? this.user()?.photo ?? null);
  readonly hasCustomPhoto = computed(() => this.customPhoto() !== null);

  /** نادي الدالة دي بعد الـ login عشان تقرا الـ user الجديد */
  refresh(): void {
    this.user.set(this.readUser());
    this.customPhoto.set(this.readCustomPhoto());
  }

  /** بتختار صورة، تقصها مربع وتصغرها، وتحفظها. بترمي Error برسالة جاهزة للعرض */
  async setPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('The image is too large. Choose one under 5 MB.');
  }

  const dataUrl = await this.resize(file, 400);

  try {
    localStorage.setItem(this.photoKey(), dataUrl);
  } catch {
    throw new Error('Not enough browser storage to save this photo.');
  }

  this.customPhoto.set(dataUrl);
  return dataUrl;   // <-- السطر ده
}

  removePhoto(): void {
    try {
      localStorage.removeItem(this.photoKey());
    } catch {
      /* ignore */
    }
    this.customPhoto.set(null);
  }

  // ===== helpers =====

  // مفتاح لكل مستخدم، عشان لو حد تاني سجل دخول على نفس المتصفح ميشوفش الصورة دي
  private photoKey(): string {
    const u = this.user();
    return `${PHOTO_KEY}_${u?._id ?? u?.id ?? 'guest'}`;
  }

  private readUser(): StoredUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      // بعض الـ APIs بتخزن { user: {...} }
      return parsed?.user ?? parsed;
    } catch {
      return null;
    }
  }

  private readCustomPhoto(): string | null {
    try {
      return localStorage.getItem(this.photoKey());
    } catch {
      return null;
    }
  }

  private resize(file: File, max: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const fail = () => reject(new Error("Couldn't read this image. Try another one."));
      const reader = new FileReader();

      reader.onerror = fail;
      reader.onload = () => {
        const img = new Image();
        img.onerror = fail;
        img.onload = () => {
          // قص مربع من النص عشان تبقى مناسبة للدايرة
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;
          const target = Math.min(side, max);

          const canvas = document.createElement('canvas');
          canvas.width = target;
          canvas.height = target;

          const ctx = canvas.getContext('2d');
          if (!ctx) return fail();

          ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }


// الصورة اللي تتعرض في أي مكان: المخصصة، وبعدها صورة الـ user، وبعدها الافتراضية حسب الجنس
readonly avatar = computed(() => {
  const gender = (this.user()?.gender ?? localStorage.getItem('gender') ?? '').toLowerCase();
  return this.photo() ?? (gender === 'male' ? '/images/deaflut.man.png' : '/images/deaflut.girl.png');
});
}