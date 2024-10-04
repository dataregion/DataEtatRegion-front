import {
  AfterViewInit,
  Component,
  EventEmitter, Inject, InjectionToken,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
} from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {TableData} from "../../../../../grouping-table/src/lib/components/grouping-table/group-utils";
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

  @Input() searchArgs: QpvSearchArgs | undefined;

  @Input() dashboardArgsCreditType: string = "";

  private _supersetBaseDashboardUrl: string = "";

  private _supersetSettings: Superset;

  public sanitizedUrl: SafeResourceUrl | undefined;

  private height: number = 0;


  constructor(
    private domSanitizer: DomSanitizer,
    // eslint-disable-next-line
    @Inject(SETTINGS) readonly settings: SettingsService,
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
      args += `&qpv_codes=${this.searchArgs.qpv_codes.join(",")}`;
    }

    if(this.searchArgs && this.searchArgs.annees && this.searchArgs.annees.length > 0) {
      args += `&years=${this.searchArgs.annees.join(",")}`;
    }
    return args;
  }

  public updateSanitizedUrl():  void {
    console.error("let me refresh");
    this.sanitizedUrl =  this.domSanitizer.bypassSecurityTrustResourceUrl(`${this._supersetBaseDashboardUrl}/${this.getDashboardSlug()}/${this.getCurrentDashboardArgsString()}`);
  }

}
