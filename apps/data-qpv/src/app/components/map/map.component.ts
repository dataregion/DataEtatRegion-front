import {Component, Input, AfterViewInit, ViewEncapsulation} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import {FullScreen, defaults as defaultControls, Control} from 'ol/control';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import {BudgetService} from "apps/data-qpv/src/app/services/budget.service";
import {GeoJSON, MVT, WKT} from "ol/format";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Feature} from "ol";
import Cluster from 'ol/source/Cluster';
import Text from 'ol/style/Text';
import {FeatureLike} from "ol/Feature";
import { MapLevelCustomControlService, LevelControl } from './map-level-custom-control.service';
import {VectorTile as VectorTileLayer} from "ol/layer";
import {VectorTile as VectorTileSource} from "ol/source";
import {QpvSearchArgs} from "../../models/qpv-search/qpv-search.models";

@Component({
  selector: 'data-qpv-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit {

  public map: Map | undefined;
  public mapId: string;
  public mapLevelControl!: LevelControl;

  contourLayer: VectorLayer;
  clusterLayer: VectorLayer;

  colorDarkBlue: string = '0, 0, 145';
  colorNavyBlue: string = '0, 30, 168';
  colorLavande: string = '154, 154, 255';

  clusterZoomThreshold = 12;

  private _searchArgs: QpvSearchArgs | undefined;
  @Input()
  set searchArgs(data: QpvSearchArgs | undefined) {
    this._searchArgs = data;
    this.mapLevelControl?.gotoCurrentCenter();
  }

  constructor(
    private budgetService: BudgetService,
    private mapLevelControlService: MapLevelCustomControlService,
  ) {
    this.mapId = `ol-map-${Math.floor(Math.random() * 100)}`;

    this.mapLevelControl = this.mapLevelControlService.createLevelControl();

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
      // declutter: true,
      style: this.clusterStyleFunction.bind(this),
      zIndex: 3,
    });

    //this.clusterStyleFunction = this.clusterStyleFunction.bind(this);
    this.contourStyleFuction = this.contourStyleFuction.bind(this);
    this.selectedContourStyleFuction = this.selectedContourStyleFuction.bind(this);
  }

  ngAfterViewInit(): void {
    const franceCoordinates = fromLonLat([1.888334, 46.603354]);

    this.map = new Map({
      target: this.mapId,
      controls: defaultControls().extend([new FullScreen()]),
      layers: [
        new TileLayer({ // Fond de carte
          source:  new XYZ({
            url: 'http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          })
        }),
        new VectorTileLayer({ // contours des territoires
          source: new VectorTileSource({
            format: new MVT(),
            url: 'https://data.geopf.fr/tms/1.0.0/ADMIN_EXPRESS/{z}/{x}/{y}.pbf',
            // maxZoom: 15,
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
    this.mapLevelControl.setCurrentMap(this.map);

    this.map.addControl(this.mapLevelControl);

    this.map?.addLayer(this.contourLayer);
    this.map?.addLayer(this.clusterLayer);

    this.fetchQpvs();
  }

  public fetchQpvs() {
    this.budgetService.getQpvs$().subscribe( qpvsData => {
      const features_countours: Feature[] = [];
      const features_points: Feature[] = [];

      qpvsData?.items?.forEach(qpv => {
        // Assuming geom is in GeoJSON format
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
        });

        // We apply countour style for each feature
        if (this._searchArgs?.qpv_codes?.includes(feature_countour.get('code'))) {
          feature_countour.setStyle(this.selectedContourStyleFuction);
        } else {
          feature_countour.setStyle(this.contourStyleFuction);
        }

        features_countours.push(feature_countour);
        features_points.push(feature_point);
      });

      this.contourLayer.getSource()?.addFeatures(features_countours);

      const clusterSource = this.clusterLayer.getSource() as Cluster<Feature>; // Get the Cluster source
      const vectorSource = clusterSource.getSource() as VectorSource; // Get the underlying VectorSource
      vectorSource.addFeatures(features_points);

      this.updateCustomControl(this._searchArgs?.qpv_codes, this._searchArgs?.annees);
    });
  }

  private updateCustomControl(
    searchedQpv: string[] | null | undefined,
    searchedYears: number[] | null | undefined
  ): void {
    const clusterSource = this.clusterLayer.getSource() as Cluster<Feature>; // Get the Cluster source
    const vectorSource = clusterSource.getSource() as VectorSource;
    const qpvFeature = this.findFeatureByCode(vectorSource, searchedQpv);
    if (qpvFeature) {
      this.mapLevelControl?.updateSelectedQpv(qpvFeature, searchedYears);
    }
  }

  private findFeatureByCode(
    vectorSource: VectorSource,
    code: string[] | null | undefined
  ): Feature | undefined {
    const features = vectorSource.getFeatures();

    for (const feature of features) {
      if (code?.includes(feature.get('code'))) {
        return feature;
      }
    }

    return undefined;
  }

  private clusterStyleFunction(feature: FeatureLike, resolution: number): Style {
    const size = feature.get('features').length; // Get number of features in the cluster

    if(size > 1) {
      return this.multiFeaturesStyleFunction(size);
    } else {
      return this.singleFeatureStyleFunction(feature);
    }
  }

  private multiFeaturesStyleFunction(size: number): Style {
    return new Style({
      image: new CircleStyle({
        radius: Math.min(30, 10 + size * 3),
        fill: new Fill({ color: `rgba( ${this.colorDarkBlue}, 1)` }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({ color: 'white' }),
        font: 'bold 16px Marianne, Calibri,sans-serif',
      }),
    });
  }

  private singleFeatureStyleFunction(feature: FeatureLike): Style {
    const featureName = feature.get('features')?.[0]?.get('name') ?? '';
    let zoomLevel: number | undefined;

    // Check if `this.map` is defined and has the necessary methods
    if (this.map && this.map.getView && typeof this.map.getView === 'function') {
      zoomLevel = this.map.getView().getZoom();
    }

    return new Style({
      image: new CircleStyle({
        radius: (zoomLevel && zoomLevel > this.clusterZoomThreshold) ? 50 : 10,
        fill: new Fill({ color: `rgba( ${this.colorLavande}, 0.2)` }),
        stroke: new Stroke({
          color: `rgba( ${this.colorLavande}, 1)`,
          width: 3
        })
      }),
      text: new Text({
        text: featureName,
        fill: new Fill({ color: `rgba( ${this.colorDarkBlue}, 1)` }),
        font: 'bold 16px Marianne, Calibri,sans-serif',
        offsetX: 0,
        // offsetY: 0,
        offsetY: (zoomLevel && zoomLevel > this.clusterZoomThreshold) ? 65 : 25,
      }),
    });
  }

  private contourStyleFuction() {
    return new Style({
      stroke: new Stroke({
        color: `rgba(${this.colorNavyBlue}, 0.8)`,
        width: 2
      })
    })
  }

  private selectedContourStyleFuction() {
    return new Style({
      fill: new Fill({
        color: `rgba( ${this.colorNavyBlue}, 0.2)`
      }),
      stroke: new Stroke({
        color: `rgba(${this.colorNavyBlue}, 0.8)`,
        width: 2
      })
    })
  }

}
