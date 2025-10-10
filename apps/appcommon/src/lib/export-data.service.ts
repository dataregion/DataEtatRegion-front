import { Injectable } from '@angular/core';
import { ExportableAsJson } from 'apps/common-lib/src/lib/models/exportable-as-json.model';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';

import * as XLSX from 'xlsx';

/**
 * Utilitaires pour l'export de données sous différents formats
 */
@Injectable({
  providedIn: 'root'
})
export class ExportDataService {
  /**
   * Création d'un Blob à partir de données exportables
   * @param data Données exportables
   * @param ext Extension désirée pour le fichier qui contiendra le Blob
   * @param columns Colonnes des données à insérer dans le Blob
   * @returns
   */
  public getBlob(
    data: ExportableAsJson[],
    ext: string,
    columns: DisplayedOrderedColumn[] | null
  ): Blob | null {
    // Transformation des données financières en JSON
    
    const jsonData = this.getDataToExport(data, columns);

    // Construction du Blob
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let buffer: any = null;
    let mimetype: string = '';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    if (ext == 'csv') {
      buffer = XLSX.utils.sheet_to_csv(worksheet);
      mimetype = 'text/csv';
    } else if (ext == 'xlsx') {
      const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (ext == 'ods') {
      const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      buffer = XLSX.write(workbook, { bookType: 'ods', type: 'array' });
      mimetype = 'application/vnd.oasis.opendocument.spreadsheet';
    }
    return buffer && mimetype ? new Blob([buffer], { type: '{{mimetype}};charset=utf-8;' }) : null;
  }


  /**
   * Convertion des données à exporter au forat JSONObject[]
   * @param data  Données exportables 
   * @param columns Colonnes des données à prendre en compte
   */
  public getDataToExport(
    data: ExportableAsJson[],
    columns: DisplayedOrderedColumn[] | null): JSONObject[] {
      const jsonData = [];
      for (const item of data) {
        let object = item.exportAsJson();
        // Si des colonnes ont été précisées
        if (columns) {
          // Suppression des colonnes non-affichées de l'objet JSON
          Object.keys(object).forEach((c) => {
            if (!columns.map((c) => c.columnLabel).includes(c)) {
              delete object[c];
            }
          });
          columns
            .filter((c) => 'displayed' in c && !c.displayed)
            .map((c) => c.columnLabel)
            .forEach((c) => {
              delete object[c];
            });
          // Ordre des données du JSON en fonction de l'ordre des colonnes
          object = Object.keys(object)
            .sort((col1, col2) => {
              const index1 = columns.findIndex((col) => col.columnLabel === col1);
              const index2 = columns.findIndex((col) => col.columnLabel === col2);
              return index1 - index2;
            })
            .reduce((obj: JSONObject, key: string) => {
              obj[key] = object[key];
              return obj;
            }, {});
        }
        jsonData.push(object);
      }
      return jsonData;
    }
}

export type DisplayedOrderedColumn = {
  columnLabel: string;
  displayed?: boolean;
};
