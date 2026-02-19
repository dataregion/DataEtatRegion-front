import { Component, AfterViewInit, ViewEncapsulation, inject, signal, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, transformExtent } from 'ol/proj';
import { FullScreen, defaults as defaultControls } from 'ol/control';
import { SessionService } from 'apps/common-lib/src/public-api';
import { REGION_GEO_CONFIGS } from './region.config';
import { VectorTile as VectorTileLayer, Vector as VectorLayer } from "ol/layer";
import { VectorTile as VectorTileSource, Vector as VectorSource, Cluster } from "ol/source";
import { Fill, Stroke, Style } from 'ol/style';
import Text from 'ol/style/Text';
import { MVT, WKT } from 'ol/format';
import { toObservable } from '@angular/core/rxjs-interop';
import { SearchDataService } from 'apps/data-qpv/src/app/services/search-data.service';
import { QpvData } from 'apps/clients/v3/data-qpv';
import { Feature } from 'ol';
import CircleStyle from 'ol/style/Circle';
import { ActivatedRoute } from '@angular/router';
import { FinancialDataResolverModel } from 'apps/data-qpv/src/app/models/financial/financial-data-resolvers.models';
import { RefQpvWithCommune } from 'apps/data-qpv/src/app/models/refs/qpv.model';
import { FeatureLike } from 'ol/Feature';

@Component({
  selector: 'data-qpv-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit, AfterViewInit {

  private _route = inject(ActivatedRoute);
  private _sessionService = inject(SessionService);
  private _searchDataService = inject(SearchDataService);
  public map?: Map;

  /** Zoom thresholds per administrative level */
  private zoomByLevel: Record<string, number> = {
    departement: 9,
    epci: 11,
    commune: 13,
  };

  private _qpvs: RefQpvWithCommune[] | undefined;

  /** Signal holding current data */
  currentMapData = signal<QpvData[] | null>(null);

  private contourLayer = new VectorLayer({
    source: new VectorSource(),
    minZoom: 10,
    zIndex: 5,
  });

  private clusterLayer = new VectorLayer({
    source: new Cluster({
      distance: 100,
      source: new VectorSource(),
    }),
    style: this.clusterStyleFunction.bind(this),
    zIndex: 10,
  });

  private clusterZoomThreshold = 12;

  private _totalMontant: number = 0;
  
  constructor() {
    toObservable(this._searchDataService.currentResults).subscribe(response => {
      if (response.mapData !== null) {
        this.currentMapData.set(response.mapData)
        this._totalMontant = this.currentMapData()?.reduce((acc, qpv) => acc + (qpv.montant ?? 0), 0) ?? 0
        this.tryRenderQpvData();
      } else {
        this.currentMapData.set(null)
        this.contourLayer.getSource()?.clear();
        this.clusterLayer.getSource()?.clear();
        this._totalMontant = 0;
      }
    })
  }

  ngOnInit() {
    // Resolve des référentiels et de la marque blanche
    const resolvedFinancial = this._route.snapshot.data['financial'] as FinancialDataResolverModel;
    this._qpvs = resolvedFinancial.data?.refGeo?.qpvs ?? [];
  }

  ngAfterViewInit(): void {
    const regionSession = this._sessionService.regionCode()
    if (!regionSession)
      return
    const regionCode = regionSession.substring(1);
    const region = REGION_GEO_CONFIGS[regionCode];

    // --- Convert extent & center to Web Mercator
    const extent3857 = transformExtent(region.extent4326, 'EPSG:4326', 'EPSG:3857');
    const center = fromLonLat(region.center4326);

    // --- Base tile layer (Carto light)
    const baseLayer = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      }),
      zIndex: 0,
    });

    // --- Administrative boundaries (Vector Tiles)
    const adminLayer = this.buildAdminBoundariesLayer(regionCode);

    // --- Create the map
    this.map = new Map({
      target: 'ol-map',
      controls: defaultControls().extend([new FullScreen()]),
      layers: [baseLayer, adminLayer, this.contourLayer, this.clusterLayer],
      view: new View({
        center,
        zoom: region.defaultZoom,
        minZoom: region.minZoom,
        maxZoom: region.maxZoom,
        extent: extent3857,
      }),
    });

    // ✅ If data was already ready before map init, render now
    this.tryRenderQpvData();
  }

  // =====================================================
  // ADMIN EXPRESS (VECTOR TILE + EXTENT REGION)
  // =====================================================
  private buildAdminBoundariesLayer(regionCode: string): VectorTileLayer {
    const url = 'https://data.geopf.fr/tms/1.0.0/ADMIN_EXPRESS/{z}/{x}/{y}.pbf';

    const region = REGION_GEO_CONFIGS[regionCode];
    const departementsRegion = region.departements; 
    const styleCache: Record<string, Style> = {};

    return new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT(),
        url,
      }),
      style: (feature, resolution) => {

        if (!this.map) return;

        const zoom = this.map.getView().getZoomForResolution(resolution);
        if (!zoom) return;
        
        const layerName = feature.get('layer');
        
        // =====================================================
        // FILTRAGE STRICT À LA RÉGION
        // =====================================================
        if (layerName === 'region') {
          const codeReg = feature.get('code_reg')
          if (codeReg !== regionCode) {
            return undefined;
          }
        }
        else if (layerName === 'epci') {
          const departements = feature.get('codes_insee_des_departements_membres').split('/')
          if (!departements.some((r: string) => departementsRegion.includes(r))) {
            return undefined;
          }
        }
        else if (layerName === 'departement' || layerName === 'commune') {
          const codeInsee = feature.get('code_insee')
          const dep = codeInsee.substring(0, 2);
          if (!departementsRegion.includes(dep)) {
            return undefined;
          }
        }
        else {
          return undefined;
        }

        // =====================================================
        // FILTRAGE PAR NIVEAU SELON ZOOM
        // =====================================================
        let expectedLayer: string | null = null;

        // Affichage des EPCI à partir du zoom 11, en dessous pas transmis par l'API
        if (zoom < 11) {
          expectedLayer = 'departement';
        }
        else if (zoom < 12) {
          expectedLayer = 'epci';
        }
        else {
          expectedLayer = 'commune';
        }

        if (layerName !== expectedLayer) {
          return undefined;
        }

        // =====================================================
        // 🎨 STYLE CACHE
        // =====================================================

        if (!styleCache[layerName]) {

          const color =
            layerName === 'departement' ? '#000091'
            : layerName === 'epci' ? '#3558C9'
            : '#597DF2';

          styleCache[layerName] = new Style({
            stroke: new Stroke({
              color,
              width: 1.5,
            }),
          });
        }

        return styleCache[layerName];
      },

      zIndex: 2,
    });
  }

  // =====================================================
  // 💶  QPV DATA RENDERING
  // =====================================================
  private tryRenderQpvData(): void {
    if (!this.map) return; // 🧱 Wait for map
    if (!this.currentMapData()) return; // 🧱 Wait for data
    this.renderQpvData();
  }

  private renderQpvData(): void {
    const data = this.currentMapData();
    if (!data || !this.map || !this._qpvs?.length) return;

    const contourSource = this.contourLayer.getSource();
    const clusterSource = this.clusterLayer.getSource() as Cluster<Feature>;
    const vectorSource = clusterSource.getSource() as VectorSource;

    contourSource?.clear();
    vectorSource.clear();

    const wktReader = new WKT();
    const qpvCodes = data.map(d => d.qpv);
    const featuresContours: Feature[] = [];
    const featuresPoints: Feature[] = [];

    this._qpvs
      .filter(q => qpvCodes.includes(q.code))
      .forEach(qpv => {
        const qpvData = data.find(d => d.qpv === qpv.code);
        if (!qpvData?.montant) return;

        const geom = qpv.geom
          ? wktReader.readGeometry(qpv.geom, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
          : null;
        const centroid = qpv.centroid
          ? wktReader.readGeometry(qpv.centroid, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
          : null;
        if (!geom || !centroid) return;

        // Contour feature
        const contourFeature = new Feature({ geometry: geom, name: qpv.label, code: qpv.code });
        contourFeature.setStyle(this.contourStyleFunction());
        featuresContours.push(contourFeature);

        // Point feature
        const pointFeature = new Feature({
          geometry: centroid,
          name: qpv.label,
          code: qpv.code,
          montant: qpvData.montant,
        });
        featuresPoints.push(pointFeature);
      });

    contourSource?.addFeatures(featuresContours);
    vectorSource.addFeatures(featuresPoints);

    // Fit map view to contours
    if (featuresContours.length) {
      const extent = contourSource!.getExtent();
      if (extent) {
        this.map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 500, maxZoom: 13 });
      }
    }
  }

  // =====================================================
  // 💶  STYLES
  // =====================================================
  private clusterStyleFunction(feature: FeatureLike): Style[] {
    const clusterFeatures = feature.get('features');
    if (!clusterFeatures) return [];

    if (clusterFeatures.length > 1) {
      return [this.multiFeaturesStyleFunction(clusterFeatures)];
    } else {
      return this.singleFeatureStyleFunction(clusterFeatures[0]);
    }
  }

  private multiFeaturesStyleFunction(features: FeatureLike[]): Style {
    const total = features.reduce((sum, f) => sum + (f.get('montant') || 0), 0);
    const count = features.length;
    const formattedMontant = `${total.toLocaleString()} €`;

    const radius = this.computeRadius(total);

    return new Style({
      image: new CircleStyle({
        radius,
        fill: new Fill({ color: 'rgba(0,0,145,1)' }),
      }),
      text: new Text({
        text: `${formattedMontant}\n${count} QPV`,
        font: 'bold 14px Marianne, Arial, sans-serif',
        fill: new Fill({ color: '#fff' }),
        textAlign: 'center',
        textBaseline: 'middle',
        padding: [4, 6, 4, 6],
      }),
    });
  }

  private singleFeatureStyleFunction(feature: FeatureLike): Style[] {
    const name = feature.get('name') ?? '';
    const montant = feature.get('montant') ?? 0;
    const zoom = this.map?.getView()?.getZoom() ?? 10;
    const radius = this.computeRadius(montant);

    const nameStyle = new Style({
      text: new Text({
        text: name,
        backgroundStroke: new Stroke({ color: `rgba(255, 255, 255, 1)`, width: 16, lineCap: 'round', lineJoin: 'round' }),
        backgroundFill: new Fill({ color: `rgba(255, 255, 255, 1)` }),
        fill: new Fill({ color: `rgba(0,0,145,1)` }),
        font: 'bold 16px Marianne, Calibri, sans-serif',
        offsetY: (zoom && zoom > this.clusterZoomThreshold) ? 75 : 35,
        textAlign: 'center',
      }),
      zIndex: 101
    });

    const montantStyle = new Style({
      image: new CircleStyle({
        radius,
        fill: new Fill({ color: 'rgba(154,154,255,0.2)' }),
        stroke: new Stroke({ color: 'rgba(154,154,255,1)', width: 3 }),
      }),
      text: new Text({
        text: `${montant.toLocaleString()} €`,
        fill: new Fill({ color: '#000' }),
        font: 'bold 16px Marianne, Calibri, sans-serif',
        textAlign: 'center',
        textBaseline: 'middle',
      }),
    });

    return [nameStyle, montantStyle];
  }

  private contourStyleFunction(): Style {
    return new Style({
      fill: new Fill({ color: 'rgba(169,191,255,0.2)' }),
      stroke: new Stroke({ color: 'rgba(0,30,168,0.8)', width: 2 }),
    });
  }

  private computeRadius(montant: number): number {
    const total = this._totalMontant;
    if (!total || montant <= 0) return 20;

    if (total === montant) return 60;

    const minRadius = 30;
    const maxAdditional = 60;

    const radius = minRadius + (montant / total) * maxAdditional;
    return radius
  }

}
