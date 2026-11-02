import { NotfoundpageComponent } from './features/notfoundpage/notfoundpage.component';
import { ChangepasswordComponent } from './features/changepassword/changepassword.component';
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { FeedComponent } from './features/feed/feed.component';
import { NotificationComponent } from './features/notification/notification.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './core/auth/guard/auth-guard';
import { notBackReturnGuard } from './core/auth/guard/not-back-return-guard';
import { DetalisComponent } from './features/feed/posts/post-center/detalis/detalis.component';


export const routes: Routes = [

{path:"", redirectTo:"login", pathMatch:"full"},

{path:"", component:AuthLayoutComponent, canActivate:[notBackReturnGuard] , children:[

{path:"login", component:LoginComponent, title:"  Login | Wanas"},

{path:"register", component:RegisterComponent, title:"  Create Account | Wanas"},

]},

{path:"", component:MainLayoutComponent , canActivate:[authGuard]  ,children:[
{path:"feed", component:FeedComponent, title:" News Feed | Wanas"},

{path:"notifications", component:NotificationComponent, title:"  Notifications | Wanas"},

{path:"profile", component:ProfileComponent, title:"   My Profile | Wanas"},
{path:"detalisPost/:id", component:DetalisComponent, title:"   Detalis Post | Wanas"},

{path:"setting", component:ChangepasswordComponent, title:"  setting|  Wanas"}
]},

{path:"notfound", component:NotfoundpageComponent, title:" Page Not Found | Wanas"},

{path:"**", redirectTo:"notfound", pathMatch:"full"}

];
