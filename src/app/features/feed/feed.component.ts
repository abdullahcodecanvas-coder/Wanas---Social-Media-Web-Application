import { Component } from '@angular/core';
import { PostCenterComponent } from './posts/post-center/post-center.component';
import { AsideRightComponent } from './posts/aside-right/aside-right.component';
import { AsideLeftComponent } from './posts/aside-left/aside-left.component';

@Component({
  selector: 'app-feed',
  imports: [PostCenterComponent , AsideRightComponent ,AsideLeftComponent ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent {
  
}
