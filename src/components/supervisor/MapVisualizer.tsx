import { useRef, useEffect } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import { defaults as defaultControls } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import type { ParadaCoords } from "../../services/supervisor/rutasService";

export function MapVisualizer({
  trayecto,
  paradas = [],
  editable = true,
}: {
  trayecto: number[][][];
  paradas?: ParadaCoords[];
  editable?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const vector = new VectorSource();
    (trayecto ?? []).forEach(segmento => {
      const geom = new LineString(segmento.map(pt => fromLonLat(pt)));
      vector.addFeature(new Feature(geom));
    });

    const paradaSource = new VectorSource();
    (paradas ?? []).forEach(({ coords }) => {
      const geom = new Point(fromLonLat(coords));
      paradaSource.addFeature(new Feature(geom));
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: vector,
          style: new Style({ stroke: new Stroke({ color: "#1976d2", width: 7 }) }),
        }),
        new VectorLayer({
          source: paradaSource,
          style: new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: "#FFD600" }),
              stroke: new Stroke({ color: "#e91e63", width: 2 })
            }),
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([-58.1731, -26.1849]),
        zoom: 14,
      }),
      controls: editable ? defaultControls() : [],
      interactions: editable ? defaultInteractions() : [],
    });

    if (trayecto.length > 0) {
      const coords = trayecto.flat();
      if (coords.length > 0) {
        const lonlats = coords.map(([lon, lat]) => fromLonLat([lon, lat]));
        const extent = new LineString(lonlats).getExtent();
        map.getView().fit(extent, { maxZoom: 16, duration: 0 });
      }
    }
    return () => map.setTarget(undefined);
  }, [trayecto, paradas, editable]);

  return (
    <div
      ref={mapRef}
      className="rounded-2xl border border-blue-200"
      style={{ height: 320, width: "100%" }}
    />
  );
}
