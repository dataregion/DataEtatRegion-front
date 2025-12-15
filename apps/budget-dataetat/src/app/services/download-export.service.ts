import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LignesFinancieresService } from "apps/clients/v3/financial-data";

@Injectable({ providedIn: 'root' })
export class DownloadExportService {
    
    private _httpClient = inject(HttpClient)
    private _lignesFinancieresService = inject(LignesFinancieresService)
    
    public downloadExport(event?: Event, export_id?: string) {
        event?.preventDefault();
        
        // XXX: Ici, le client généré fait de la !$@%!#$%, on passe sur un httpClient plus manuel
        const baseP = this._lignesFinancieresService.configuration.basePath
        const full_url = `${baseP}/lignes/download/${export_id!}`

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