import { Component, computed, HostListener, inject, Input, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/Services/auth.service';
import { ProfileService } from '../../features/profile/services/profile-service.service';
import { SearchService } from './services/seacrch.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  user = this.profileService.user;
  photo = this.profileService.photo;

  isMenuOpen = signal<boolean>(false);

  // الجنس من الـ user لو موجود، وإلا من المفتاح المنفصل في localStorage
  private isMale(): boolean {
    const gender = this.user()?.gender ?? localStorage.getItem('gender');
    return gender?.toLowerCase() === 'male';
  }

  // الصورة الافتراضية حسب الجنس
  defaultAvatar = computed(() => {
    this.user(); // عشان تتحدث لما الـ user يتغير
    return this.isMale() ? '/images/deaflut.man.png' : '/images/deaflut.girl.png';
  });

  // صورة اليوزر لو موجودة، وإلا الافتراضية
  avatar = computed(() => this.photo() ?? this.defaultAvatar());

  // لو لينك الصورة باظ، نرجع للافتراضية
  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('deaflut')) {
      img.src = this.defaultAvatar();
    }
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen.update((prev) => !prev);
  }

  @HostListener('document:click')
  closeMenu(): void {
    if (this.isMenuOpen()) {
      this.isMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMenuOpen()) {
      this.isMenuOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
    this.profileService.refresh(); // يمسح بيانات اليوزر القديم من الـ navbar
  }



  private readonly searchService = inject(SearchService);

searchUsers(event: Event): void {
  const value = (event.target as HTMLInputElement).value;

  this.searchService.setSearchTerm(value.trim().toLowerCase());
}
 
}