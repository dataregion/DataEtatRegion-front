import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public loading$ = new Subject<boolean>();
  private _loadingOperationCount = 0;

  /**
   * Chargement en cours
   */
  public startLoader(): void {
    this._loadingOperationCount++;
    this.loading$.next(this.hasLoadingOperations());
  }

  /**
   *
   * @returns Observable loader
   */
  public isLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  /**
   * Chargement terminé
   */
  public endLoader(): void {
    this._loadingOperationCount--;
    this.loading$.next(this.hasLoadingOperations());
  }

  private hasLoadingOperations() {
    return this._loadingOperationCount > 0;
  }
}
