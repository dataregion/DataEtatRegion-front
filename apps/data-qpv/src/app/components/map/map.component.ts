import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import {BudgetService} from "apps/data-qpv/src/app/services/budget.service";
import {GeoJSON, WKT} from "ol/format";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Feature} from "ol";
import Cluster from 'ol/source/Cluster';
import Text from 'ol/style/Text';
import {FeatureLike} from "ol/Feature";

@Component({
  selector: 'data-qpv-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: Map | undefined;

  color_dark_blue: string = '0, 0, 145'
  color_navy_blue: string = '0, 30, 168'
  color_lavande: string = '154, 154, 255'

  constructor(private budgetService: BudgetService) {
    this.clusterStyleFunction = this.clusterStyleFunction.bind(this);
    this.contourStyleFuction = this.contourStyleFuction.bind(this);
  }

  ngOnInit(): void {
    const franceCoordinates = fromLonLat([1.888334, 46.603354]);

    this.map = new Map({
      target: 'ol-map',
      layers: [
        new TileLayer({
          source:  new XYZ({
            url: 'http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: franceCoordinates,
        zoom: 6,
        projection: 'EPSG:3857',
      })
    });
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
        });

        const point = new WKT().readGeometry(qpv.centroid, {
          dataProjection: 'EPSG:4326', // Data is in lat/lon (WGS84)
          featureProjection: 'EPSG:3857' // Transform to Web Mercator for OpenLayers
        });

        const feature_point = new Feature({
          geometry: point,
          name: qpv.label,
        });

        // Style for each feature (optional)
        feature_countour.setStyle(this.contourStyleFuction);

        features_countours.push(feature_countour);
        features_points.push(feature_point);
      });

      // Create a vector source with the features
      const vectorSourceContours = new VectorSource({
        features: features_countours
      });

      // Add the vector layer to the map
      const vectorLayer = new VectorLayer({
        source: vectorSourceContours
      });

      // Create a vector source with the features
      const vectorSourcePoints = new VectorSource({
        features: features_points
      });

      const clusterSource = new Cluster({
        distance: 100, // Distance in pixels to cluster
        source: vectorSourcePoints
      });

      const clusterLayer = new VectorLayer({
        source: clusterSource,
        // declutter: true,
        style: this.clusterStyleFunction
      });

      this.map?.addLayer(vectorLayer);
      this.map?.addLayer(clusterLayer);
    });
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
        fill: new Fill({ color: `rgba( ${this.color_dark_blue}, 1)` }),
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
        radius: (zoomLevel && zoomLevel > 12) ? 50 : 10,
        fill: new Fill({ color: `rgba( ${this.color_lavande}, 0.2)` }),
        stroke: new Stroke({
          color: `rgba( ${this.color_lavande}, 1)`,
          width: 3
        })
      }),
      text: new Text({
        text: featureName,
        fill: new Fill({ color: `rgba( ${this.color_dark_blue}, 1)` }),
        font: 'bold 16px Marianne, Calibri,sans-serif',
        offsetX: 0,
        // offsetY: 0,
        offsetY: (zoomLevel && zoomLevel > 12) ? 65 : 25,
      }),
    });
  }

  private contourStyleFuction() {
    return new Style({
      stroke: new Stroke({
        color: `rgba(${this.color_navy_blue}, 0.8)`,
        width: 1
      })
    })
  }

}
