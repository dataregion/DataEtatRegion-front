import {
  Component,
  Inject,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import {SettingsService} from "../../../environments/settings.service";
import {Superset} from "../../../../../common-lib/src/lib/environments/settings";
import {QpvSearchArgs} from "../../models/qpv-search/qpv-search.models";


@Component({
  selector: 'data-qpv-superset-iframe',
  templateUrl: './superset-iframe.component.html',
  styleUrls: ['./superset-iframe.component.scss'],
  providers: []
})
export class SupersetIframeComponent implements OnInit, OnChanges {

  @Input() dashboardSlugType!: string;

  @Input() searchArgs: QpvSearchArgs | null = null;

  @Input() dashboardArgsCreditType: string = "";

  private _supersetBaseDashboardUrl: string = "";

  private _supersetSettings: Superset;

  public sanitizedUrl: SafeResourceUrl | undefined;

  constructor(
    private _domSanitizer: DomSanitizer,
    @Inject(SETTINGS) readonly settings: SettingsService, // eslint-disable-line
  ) {
    this._supersetSettings = settings.getSuperset();
  }

  ngOnInit(): void {
    this._supersetBaseDashboardUrl = this._supersetSettings.baseDashboardUrl;
    this.updateSanitizedUrl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If any input property changes, update the sanitized URL
    if (changes['searchArgs']) {
      this.updateSanitizedUrl();
    }
  }

  private getDashboardSlug(): string {
    if (this.dashboardSlugType in this._supersetSettings.dashboardsSlugs) {
      return this._supersetSettings.dashboardsSlugs[this.dashboardSlugType];
    }
    return "";
  }

  private getCurrentDashboardArgsString(): string {
    let args = "";
    args += `?standalone=3&embedded=true`;

    if (this.dashboardArgsCreditType && this.dashboardArgsCreditType !== "") {
      args += `&credit_type=${this.dashboardArgsCreditType}`;
    }

    if(this.searchArgs && this.searchArgs.qpv_codes && this.searchArgs.qpv_codes.length > 0) {
      args += `&qpv_codes=${this.searchArgs.qpv_codes.map(q => q.code).join(",")}`;
    }

    if(this.searchArgs && this.searchArgs.annees && this.searchArgs.annees.length > 0) {
      args += `&years=${this.searchArgs.annees.join(",")}`;
    }

    if(this.searchArgs && this.searchArgs.niveau && this.searchArgs.localisations && this.searchArgs.localisations.length > 0) {
      args += `&niveau_geo=${this.searchArgs.niveau.toLowerCase()}&codes_geo=${this.searchArgs.localisations.map(l => l.code).join(",")}`;
    }

    return args;
  }

  public updateSanitizedUrl():  void {
    this.sanitizedUrl =  this._domSanitizer.bypassSecurityTrustResourceUrl(`${this._supersetBaseDashboardUrl}/${this.getDashboardSlug()}/${this.getCurrentDashboardArgsString()}`);
    console.log(this.sanitizedUrl)
  }

}
