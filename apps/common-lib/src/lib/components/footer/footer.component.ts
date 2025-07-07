import { Component, Input, inject } from '@angular/core';
import { ISettingsService } from '../../environments/interface-settings.service';
import { SETTINGS } from '../../environments/settings.http.service';

@Component({
    selector: 'lib-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: false
})
export class FooterComponent {
  readonly settings = inject<ISettingsService>(SETTINGS);

  public contact?: string;
  public url_github?: string;
  @Input()
  logo: string = 'Infradonnee.svg';

  constructor() {
    const settings = this.settings;

    this.contact = settings.getSetting().contact;
    this.url_github = settings.getSetting().url_github;
  }
}
