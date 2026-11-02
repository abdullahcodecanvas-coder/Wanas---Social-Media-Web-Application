import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/auth/Services/auth.service';
import { ProfileService } from '../../../profile/services/profile-service.service';

@Component({
  selector: 'app-aside-left',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside-left.component.html',
  styleUrl: './aside-left.component.css',
})
export class AsideLeftComponent {
   private readonly authService = inject(AuthService);
private readonly profileService = inject(ProfileService);

user = this.profileService.user;
photo = this.profileService.photo;
   logout(): void {

   this.authService.logout()
  }
}
