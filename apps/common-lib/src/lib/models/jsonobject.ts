export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
  [k: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>
