
export interface RegionGeoConfig {
  code: string;
  name: string;
  extent4326: [number, number, number, number];
  center4326: [number, number];
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
}

export const REGION_GEO_CONFIGS: Record<string, RegionGeoConfig> = {
  53: {
    code: '53',
    name: 'Bretagne',
    extent4326: [-6.350342,46.349989,0.708618,49.969400],
    center4326: [-3.029480,48.197218],
    defaultZoom: 1,
    minZoom: 1,
    maxZoom: 16,
  },
  52: {
    code: '52',
    name: 'Pays de la Loire',
    extent4326: [-2.724609,46.206448,1.159058,48.603858],
    center4326: [-0.744324,47.470806],
    defaultZoom: 7,
    minZoom: 7,
    maxZoom: 16,
  },
}