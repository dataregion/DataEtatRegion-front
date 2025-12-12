import { HttpClient } from "@angular/common/http";
import { Component, inject, OnInit } from "@angular/core";
import { ExportFinancialTask, LignesFinancieresService } from "apps/clients/v3/financial-data";
import { BarElement } from "chart.js";

@Component({
    selector: 'budget-exports',
    templateUrl: './exports.component.html',
    styleUrls: [ 'exports.component.scss' ],
    standalone: true,
})
export class ExportsComponent implements OnInit {

    private _httpClient = inject(HttpClient)
    private _lignesFinancieresService = inject(LignesFinancieresService)

    public exports: ExportFinancialTask[] = []

    ngOnInit(): void {
        this._lignesFinancieresService.listExportsLignesExportsGet()
        .subscribe(
            {
                next: (response) => {
                    const exports = response.data;
                    this.exports = exports || [];
                }
            }
        )
    }

    public onExportDownload(event: Event, task: ExportFinancialTask) {
        event?.preventDefault();
        
        // XXX: Ici, le client généré fait de la !$@%!#$%, on passe sur un httpClient plus manuel
        const baseP = this._lignesFinancieresService.configuration.basePath
        const full_url = `${baseP}/lignes/download/${task.prefect_run_id}`

        this._httpClient.get(
            full_url, 
            {
                responseType: 'blob',
            }
        )
        .subscribe(
            {
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    
                    link.href = url;
                    link.download = `export`;
                    link.click();
                },
                error: (err) => console.log(err)
            }
        )
    }
    
}