import { JSONObject } from "./jsonobject";

/**
 * Définit un objet qui peut s'exporter lui même en JSON
 */
export interface ExportableAsJson {
    exportAsJson(): JSONObject
}