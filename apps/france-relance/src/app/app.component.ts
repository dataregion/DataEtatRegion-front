import { Component, OnInit, inject } from '@angular/core';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { LoaderService, SessionService } from 'apps/common-lib/src/public-api';
import { SettingsService } from '../environments/settings.service';

@Component({
    selector: 'france-relance-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  private _loaderService = inject(LoaderService);
  private _sessionService = inject(SessionService);
  private _gridFullscreen = inject(GridInFullscreenStateService);
  readonly settings = inject<SettingsService>(SETTINGS);

  public progressBarVisible: boolean = false;
  public isAuthenticated: boolean = false;

  public displayAdmin = false;

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }

  ngOnInit(): void {
    this._loaderService.isLoading().subscribe((loading) => {
      this.progressBarVisible = loading;
    });

    this._sessionService.getUser().subscribe((user) => {
      this.isAuthenticated = user !== null;
      this.displayAdmin = this._sessionService.isAdmin();
    });
  }

  public get contact(): string | undefined {
    return this.settings.getSetting().contact;
  }
}
