import { Component, inject, OnInit } from "@angular/core";
import { DownloadExportService } from "@services/download-export.service";
import { ExportFinancialTask, LignesFinancieresService } from "apps/clients/v3/financial-data";

@Component({
    selector: 'budget-exports',
    templateUrl: './exports.component.html',
    standalone: true,
})
export class ExportsComponent implements OnInit {

    private downloadExportService = inject(DownloadExportService)
    private _lignesFinancieresService = inject(LignesFinancieresService)

    public loading = true;
    public exports: ExportFinancialTask[] = []

    ngOnInit(): void {
        this.loading = true;
        this._lignesFinancieresService.listExportsLignesExportsGet()
        .subscribe(
            {
                next: (response) => {
                    this.loading = false;
                    const exports = response.data;
                    this.exports = exports || [];
                }
            }
        )
    }

    public onExportDownload(event: Event, task: ExportFinancialTask) {
        this.downloadExportService.downloadExport(event, task.prefect_run_id)
    }
    
}