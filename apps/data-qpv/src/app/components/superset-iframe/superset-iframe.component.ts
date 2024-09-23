import {
  AfterViewInit,
  Component,
  EventEmitter, Inject, InjectionToken,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {TableData} from "../../../../../grouping-table/src/lib/components/grouping-table/group-utils";
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import {SettingsService} from "../../../environments/settings.service";
import {Superset} from "../../../../../common-lib/src/lib/environments/settings";

@Component({
  selector: 'data-qpv-superset-iframe',
  templateUrl: './superset-iframe.component.html',
  styleUrls: ['./superset-iframe.component.scss'],
  providers: []
})
export class SupersetIframeComponent implements OnInit {

  @Input() dashboardSlugType!: string;
  @Input() dashboardArgsQpvCodes!: string[];
  @Input() dashboardArgsQpvYears!: string[];

  @Input() dashboardArgsCreditType: string = "";

  private _supersetBaseDashboardUrl: string = "";

  private _supersetSettings: Superset;


  constructor(
    private domSanitizer: DomSanitizer,
    // eslint-disable-next-line
    @Inject(SETTINGS) readonly settings: SettingsService,
  ) {
    this._supersetSettings = settings.getSuperset();
  }

  ngOnInit(): void {
    this._supersetBaseDashboardUrl = this._supersetSettings.baseDashboardUrl;
  }

  private getDashboardSlug(): string {
    if (this.dashboardSlugType in this._supersetSettings.dashboardsSlugs) {
      return this._supersetSettings.dashboardsSlugs[this.dashboardSlugType];
    }
    return "";
  }

  private getCurrentDashboardArgsString(): string {
    let args = "";
    args += `?standalone=true`;

    if (this.dashboardArgsCreditType && this.dashboardArgsCreditType ! === "") {
      args += `&credit_type=${this.dashboardArgsCreditType}`;
    }

    if(this.dashboardArgsQpvCodes && this.dashboardArgsQpvCodes.length > 0) {
      args += `&qpv_codes=${this.dashboardArgsQpvCodes.join(",")}`;
    }

    if(this.dashboardArgsQpvYears && this.dashboardArgsQpvYears.length > 0) {
      args += `&years=${this.dashboardArgsQpvYears.join(",")}`;
    }
    return args;
  }

  public getSanitizedUrl():  SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`${this._supersetBaseDashboardUrl}/${this.getDashboardSlug()}/${this.getCurrentDashboardArgsString()}`);
  }

}
