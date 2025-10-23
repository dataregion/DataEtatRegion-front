import { Component, Input, AfterViewInit, ViewEncapsulation, OnDestroy, input, effect, computed, inject } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { FullScreen, defaults as defaultControls } from 'ol/control';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import { MVT, WKT } from "ol/format";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Feature } from "ol";
import Cluster from 'ol/source/Cluster';
import Text from 'ol/style/Text';
import { FeatureLike } from "ol/Feature";
import { MapLevelCustomControlService, LevelControl } from './map-level-custom-control.service';
import { VectorTile as VectorTileLayer } from "ol/layer";
import { VectorTile as VectorTileSource } from "ol/source";
import { FinancialDataModel } from "../../../../models/financial/financial-data.models";
import { QpvWithMontant, RefQpvWithCommune } from '../../../../models/refs/qpv.model';
import { createEmpty, extend, Extent } from 'ol/extent';
import { TypeLocalisation } from 'apps/common-lib/src/public-api';
import { SearchDataService } from 'apps/data-qpv/src/app/services/search-data.service';

@Component({
  selector: 'data-qpv-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements AfterViewInit, OnDestroy {

  private _searchDataService = inject(SearchDataService);
  private _mapLevelControlService = inject(MapLevelCustomControlService);


  public map: Map | undefined;
  public mapId: string;
  public mapLevelControl!: LevelControl;

  contourLayer: VectorLayer;
  clusterLayer: VectorLayer;

  colorDarkBlue: string = '0,0,145';
  colorNavyBlue: string = '0,30,168';
  colorLightBlue: string = '169,191,255';

  colorSelected: string = '252,198,58';

  colorLavande: string = '154,154,255';

  clusterZoomThreshold = 12;

  readonly searchParams = computed(() => this._searchDataService.searchParams());

  public readonly financialData = input<FinancialDataModel[]>();
  public readonly qpv = input<RefQpvWithCommune[]>([]);

  qpvWithMontant = computed(() => {
    const financialData = this.financialData() ?? [];
    const groupedQpvMontant = financialData.reduce((acc, item) => {
      const key = item.lieu_action?.code_qpv;

      if (key) {
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += item.montant_ae ?? 0;
      }
      return acc;
    }, {} as Record<string, number>);

    const qpvWithMontant = this.qpv().map(qpv => {
      if (groupedQpvMontant[qpv.code]) {
        return { ...qpv, montant: groupedQpvMontant[qpv.code] } as QpvWithMontant;
      } else {
        return { ...qpv, montant: 0 } as QpvWithMontant;
      }
    });
    return qpvWithMontant;
  });

  public readonly totalMontant = computed(() =>
    this.qpvWithMontant().reduce((acc, qpv) => acc + qpv.montant, 0)
  );

  // Zoom de base
  private _pendingExtent: Extent | null = null;

  constructor() {
    this.mapId = `ol-map-${Math.floor(Math.random() * 100)}`;

    this.mapLevelControl = this._mapLevelControlService.createLevelControl();

    this.contourLayer = new VectorLayer({
      source: new VectorSource(),
      minZoom: this.clusterZoomThreshold,
      zIndex: 2,
    });

    this.clusterLayer = new VectorLayer({
      source: new Cluster({
        source: new VectorSource(),
        distance: 75, // Distance in pixels to cluster
      }),
      style: this.clusterStyleFunction.bind(this),
      zIndex: 9,
    });

    this.contourStyleFuction = this.contourStyleFuction.bind(this);
    this.selectedContourStyleFuction = this.selectedContourStyleFuction.bind(this);

    effect(() => {
      const qpvWithMontant = this.qpvWithMontant();
      this._loadDataMap(qpvWithMontant);
    });
  }


  ngAfterViewInit(): void {
    const franceCoordinates = fromLonLat([1.888334, 46.603354]);

    this.map = new Map({
      target: this.mapId,
      controls: defaultControls().extend([new FullScreen()]),
      layers: [
        new TileLayer({ // Fond de carte
          source: new XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          })
        }),
        new VectorTileLayer({ // contours des territoires
          source: new VectorTileSource({
            format: new MVT(),
            url: 'https://data.geopf.fr/tms/1.0.0/ADMIN_EXPRESS/{z}/{x}/{y}.pbf',
          }),
          style: new Style({
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0)',
            }),
            stroke: new Stroke({
              color: 'rgba(110, 110, 110, 1)',
            }),
          }),
          visible: true,
          opacity: 0.9,
          zIndex: 1,
        })
      ],
      view: new View({
        center: franceCoordinates,
        zoom: 6,
        projection: 'EPSG:3857',
      })
    });
    this.mapLevelControl.initCurrentMap(this.map);

    this.map.addControl(this.mapLevelControl);

    this.map?.addLayer(this.contourLayer);
    this.map?.addLayer(this.clusterLayer);

    if (this._pendingExtent) {
      this.map.getView().fit(this._pendingExtent, { padding: [50, 50, 50, 50], duration: 500 });
      this._pendingExtent = null;
    }
    
  }

  private _loadDataMap(qpvWithMontant: QpvWithMontant[]) {
    const features_countours: Feature[] = [];
    const features_points: Feature[] = [];
    qpvWithMontant.forEach(qpv => {
      const geom = new WKT().readGeometry(qpv.geom, {
        dataProjection: 'EPSG:4326', // Data is in lat/lon (WGS84)
        featureProjection: 'EPSG:3857' // Transform to Web Mercator for OpenLayers
      });

      const feature_countour = new Feature({
        geometry: geom,
        name: qpv.label,
        code: qpv.code,
      });

      const point = new WKT().readGeometry(qpv.centroid, {
        dataProjection: 'EPSG:4326', // Data is in lat/lon (WGS84)
        featureProjection: 'EPSG:3857' // Transform to Web Mercator for OpenLayers
      });

      const feature_point = new Feature({
        geometry: point,
        name: qpv.label,
        code: qpv.code,
        montant: qpv.montant
      });

      feature_countour.setStyle(this.selectedContourStyleFuction);
      features_countours.push(feature_countour);
      features_points.push(feature_point);
    });

    this.contourLayer.getSource()?.addFeatures(features_countours);

    const clusterSource = this.clusterLayer.getSource() as Cluster<Feature>;
    const vectorSource = clusterSource.getSource() as VectorSource;
    vectorSource.clear();
    vectorSource.addFeatures(features_points);
    // ✅ Calcul de l’extent des contours
    const extent = createEmpty();
    features_countours.forEach(f => {
      extend(extent, f.getGeometry()!.getExtent());
    });
    this._pendingExtent = extent;
    // ✅ Fit sur la vue
    if (this.map && extent) {
      this.map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 500,
        maxZoom: 14, // optionnel : limite le zoom trop près
      });
    } else { // on est dans le cas où la map n'est pas encore chargé dans le dom
      this._pendingExtent = extent;
    }
    this.updateCustomControl();
  }

  private updateCustomControl(): void {

    const selectedQpv = this.searchParams()?.code_qpv?.map(qpv => qpv.nom);
    const selectLocalisation = this.searchParams()?.locations?.map(loc => loc.nom);
    
    const selectElement = selectedQpv ?? selectLocalisation;
    const selectedAnnees = this.searchParams()?.years;
    const selectedNiveau = selectedQpv ? TypeLocalisation.QPV : this.searchParams()?.niveau;

    const clusterSource = this.clusterLayer.getSource() as Cluster<Feature>; // Get the Cluster source
    const vectorSource = clusterSource.getSource() as VectorSource;
    this.mapLevelControl?.updateControl(selectElement, selectedAnnees, selectedNiveau, vectorSource.getFeatures());
  }


  private clusterStyleFunction(feature: FeatureLike): Style[] {
    const size = feature.get('features').length; // Get number of features in the cluster

    if (size > 1) {
      return [this.multiFeaturesStyleFunction(feature.get('features'))];
    } else {
      return this.singleFeatureStyleFunction(feature.get('features')?.[0]);
    }
  }

  private multiFeaturesStyleFunction(features: FeatureLike[]): Style {
    const circleColor = this.colorDarkBlue;
    const totalMontant = features.reduce((acc, f) => {
      const m = f.get('montant');
      return acc + (typeof m === 'number' ? m : 0);
    }, 0);

    const formattedMontant = `${totalMontant.toLocaleString()} €`;

    return new Style({
      image: new CircleStyle({
        radius: this.computeRadius(totalMontant),
        fill: new Fill({ color: `rgba(${circleColor}, 1)` }),
      }),
      text: new Text({
        text: formattedMontant,
        fill: new Fill({ color: '#fff' }),
        font: 'bold 14px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
      }),
      zIndex: 1,
    });
  }

  private singleFeatureStyleFunction(feature: FeatureLike): Style[] {
    const featureName = feature?.get('name') ?? '';
    const montant = feature?.get('montant') ?? 0;
    let zoomLevel: number | undefined;

    // Check if `this.map` is defined and has the necessary methods
    if (this.map && this.map.getView && typeof this.map.getView === 'function') {
      zoomLevel = this.map.getView().getZoom();
    }
    const circleColor = this.colorLavande;

    const nomStyle = new Style({
      text: new Text({
        backgroundStroke: new Stroke({ color: `rgba(255, 255, 255, 1)`, width: 16, lineCap: 'round', lineJoin: 'round' }),
        backgroundFill: new Fill({ color: `rgba(255, 255, 255, 1)` }),
        text: featureName,
        fill: new Fill({ color: `rgba(${this.colorDarkBlue}, 1)` }),
        font: 'bold 14px Marianne, Calibri, sans-serif',
        offsetY: (zoomLevel && zoomLevel > this.clusterZoomThreshold) ? 75 : 35,
        textAlign: 'center',
      }),
      zIndex: 101
    });
    const radius = this.computeRadius(montant);

    const montantStyle = new Style({
      image: new CircleStyle({
        radius: radius,
        fill: new Fill({ color: `rgba(${circleColor}, 0.2)` }),
        stroke: new Stroke({ color: `rgba(${circleColor}, 1)`, width: 3 })
      }),
      text: new Text({
        text: `${montant.toLocaleString()} €`,
        fill: new Fill({ color: '#000' }), // texte noir au centre
        font: 'bold 14px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
      }),
      zIndex: 100
    });
    return [nomStyle, montantStyle];
  }

  private contourStyleFuction() {
    return new Style({
      fill: new Fill({
        color: `rgba( ${this.colorLightBlue}, 0.2)`
      }),
      stroke: new Stroke({
        color: `rgba(${this.colorNavyBlue}, 0.8)`,
        width: 2
      })
    })
  }

  private selectedContourStyleFuction() {
    return new Style({
      fill: new Fill({
        color: `rgba( ${this.colorSelected}, 0.2)`
      }),
      stroke: new Stroke({
        color: `rgba(${this.colorSelected}, 0.8)`,
        width: 2
      })
    })
  }

  private computeRadius(montant: number): number {
    const total = this.totalMontant();
    if (!total || montant <= 0) return 20;

    if (total === montant) return 60;

    const minRadius = 30;
    const maxAdditional = 60;

    const radius = minRadius + (montant / total) * maxAdditional;
    return radius
  }

  ngOnDestroy(): void {
    this.mapLevelControl.onDestroy();
  }

}
