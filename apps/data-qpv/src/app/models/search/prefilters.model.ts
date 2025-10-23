import { JSONObject } from "apps/common-lib/src/lib/models/jsonobject"

export interface PreFilters {

  annees?: number[]
  localisation?: JSONObject[]
  qpv?: JSONObject[]
  financeurs?: JSONObject[]
  thematiques?: JSONObject[]
  porteurs?: JSONObject[]
  types_porteur?: JSONObject[]

}
