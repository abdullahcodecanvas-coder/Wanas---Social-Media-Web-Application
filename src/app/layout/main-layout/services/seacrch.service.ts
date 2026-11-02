import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchTerm = signal('');

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }
}