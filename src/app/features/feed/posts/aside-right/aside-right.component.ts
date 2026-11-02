import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-aside-right',
  imports: [NgClass],
  templateUrl: './aside-right.component.html',
  styleUrl: './aside-right.component.css',
})
export class AsideRightComponent {
    private readonly PAGE_SIZE = 6;
 
  // عدد الأشخاص الظاهرين حاليًا
  visibleCount = this.PAGE_SIZE;
 
  people: Companion[] = [
    { name: 'Nadeen Ragab',     sub: '4 mutual companions', img: 'https://i.pravatar.cc/100?img=11', isFriend: false },
    { name: 'Dr. Shady Hassan', sub: 'Shared Books',        img: 'https://i.pravatar.cc/100?img=12', isFriend: false },
    { name: 'Meriam Sobhy',     sub: 'Followed by friends', img: 'https://i.pravatar.cc/100?img=13', isFriend: false },
    { name: 'Omar Khaled',      sub: '2 mutual companions', img: 'https://i.pravatar.cc/100?img=14', isFriend: false },
    { name: 'Sara Adel',        sub: 'Shared Books',        img: 'https://i.pravatar.cc/100?img=15', isFriend: false },
    { name: 'Youssef Samir',    sub: 'Followed by friends', img: 'https://i.pravatar.cc/100?img=16', isFriend: false },
 
    { name: 'Mariam Tarek',     sub: '6 mutual companions', img: 'https://i.pravatar.cc/100?img=17', isFriend: false },
    { name: 'Ahmed Fathy',      sub: 'Shared Books',        img: 'https://i.pravatar.cc/100?img=18', isFriend: false },
    { name: 'Hana Mostafa',     sub: 'Followed by friends', img: 'https://i.pravatar.cc/100?img=19', isFriend: false },
    { name: 'Karim Nabil',      sub: '3 mutual companions', img: 'https://i.pravatar.cc/100?img=20', isFriend: false },
    { name: 'Laila Ibrahim',    sub: 'Shared Books',        img: 'https://i.pravatar.cc/100?img=21', isFriend: false },
    { name: 'Mostafa Ali',      sub: 'Followed by friends', img: 'https://i.pravatar.cc/100?img=22', isFriend: false },
  ];
 
  get visiblePeople(): Companion[] {
    return this.people.slice(0, this.visibleCount);
  }
 
  get hasMore(): boolean {
    return this.visibleCount < this.people.length;
  }
 
  showMore(): void {
    this.visibleCount += this.PAGE_SIZE;
  }
 
  toggleFollow(p: Companion): void {
    p.isFriend = !p.isFriend;
  }
 
  // لو الصورة ماحملتش، نعرض دايرة فيها حروف الاسم
  onImgError(event: Event, name: string): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = `https://ui-avatars.com/api/?background=FF7A12&color=fff&name=${encodeURIComponent(name)}`;
  }
}
