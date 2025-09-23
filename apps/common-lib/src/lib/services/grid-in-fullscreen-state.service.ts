import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridInFullscreenStateService {
  
  // Signals API
  private readonly _isFullscreen = signal<boolean>(false);
  
  public readonly isFullscreen = this._isFullscreen.asReadonly();
  
  public setFullscreen(fullscreen: boolean): void {
    this._isFullscreen.set(fullscreen);
  }
  
  public toggleFullscreen(): boolean {
    const newState = !this._isFullscreen();
    this._isFullscreen.set(newState);
    return newState;
  }
  
  // Legacy API (deprecated)
  /** @deprecated Utiliser isFullscreen() signal */
  public get fullscreen(): boolean {
    return this._isFullscreen();
  }

  /** @deprecated Utiliser setFullscreen(boolean) */
  public set fullscreen(data: boolean) {
    this._isFullscreen.set(data);
  }
}
