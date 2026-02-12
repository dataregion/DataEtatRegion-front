import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LignesFinancieresService } from "apps/clients/v3/financial-data";

@Injectable({ providedIn: 'root' })
export class DownloadExportService {
    
    private _httpClient = inject(HttpClient)
    private _lignesFinancieresService = inject(LignesFinancieresService)
    
    /**
     * Extrait le nom du fichier depuis l'en-tête Content-Disposition
     * Gère à la fois filename et filename* (UTF-8)
     */
    private parseFilenameFromContentDisposition(header: string | null): string | null {
        if (!header) return null;
        
        // Gère filename*=UTF-8''... (RFC 5987)
        const filenameStar = header.match(/filename\*=UTF-8''([^;]+)/i);
        if (filenameStar) {
            return decodeURIComponent(filenameStar[1].replace(/["']/g, ''));
        }
        
        // Gère filename="..." ou filename=...
        const filename = header.match(/filename=["']?([^;"']+)["']?/i);
        return filename ? filename[1] : null;
    }
    
    public downloadExport(event?: Event, export_id?: string) {
        event?.preventDefault();
        
        // XXX: Ici, le client généré fait de la !$@%!#$%, on passe sur un httpClient plus manuel
        const baseP = this._lignesFinancieresService.configuration.basePath
        const full_url = `${baseP}/lignes/download/${export_id!}`

        this._httpClient.get(
            full_url, 
            {
                responseType: 'blob',
                observe: 'response',
            }
        )
        .subscribe(
            {
                next: (response) => {
                    const contentDisposition = response.headers.get('content-disposition');
                    const filename = this.parseFilenameFromContentDisposition(contentDisposition) || 'export';
                    
                    const blob = response.body!;
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    
                    link.href = url;
                    link.download = filename;
                    link.click();
                    
                    // Nettoyage de l'URL blob
                    window.URL.revokeObjectURL(url);
                },
                error: (err) => console.log(err)
            }
        )
    }
}