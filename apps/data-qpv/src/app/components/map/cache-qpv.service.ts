import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheQPVService {

  private cache = new Map<string, any>();
  public cache$ = new BehaviorSubject<any | undefined>(undefined);

  set(key: string, data: any): void {
    if (this.cache.has(key)) {
      throw new Error(`Data already exists for key '${key}'. Use a different key or delete the existing one first.`);
    }
    this.cache.set(key, data);
    this.cache$.next(this.cache.get(key));
  }

  get(key: string): any | undefined {
    const data = this.cache.get(key);
    this.cache$.next(data);
    return data;
  }

  clear(key: string): void {
    this.cache.delete(key);
    this.cache$.next(undefined);
  }

}