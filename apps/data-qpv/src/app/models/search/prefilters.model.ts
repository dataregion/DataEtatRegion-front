import { JSONObject } from "apps/common-lib/src/lib/models/jsonobject"
import { GeoModel } from "apps/common-lib/src/public-api"

export interface PreFilters {

  annees?: number[]
  localisation?: JSONObject[]
  qpv?: GeoModel

}
