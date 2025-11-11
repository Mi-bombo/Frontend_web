import "ol/ol.css";
import { useRef, useEffect } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { defaults as defaultInteractions } from "ol/interaction";
import Select from "ol/interaction/Select";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import { Fill, Circle as CircleStyle } from "ol/style";
import { always, click } from "ol/events/condition";
import type { ParadaCoords } from "../../services/supervisor/rutasService";
import { MapVisualizer } from "./MapVisualizer";

export type TrayectoMulti = number[][][];
export type Parada = Feature;

const formosaCenter = fromLonLat([-58.1731, -26.1849]);
const extentFormosa = transformExtent(
  [-58.2400, -26.2400, -58.0800, -26.1200],
  "EPSG:4326",
  "EPSG:3857"
);

export function TrayectoMap({
  onTrayectoSeleccionado,
}: {
  onTrayectoSeleccionado: (trayectoCoords: TrayectoMulti) => void;
}) {
  const mapDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    const callesSource = new VectorSource();

    fetch("/calles_formosa.geojson")
      .then((resp) => resp.json())
      .then((data) => {
        callesSource.clear();
        let id_tramo = 1;
        data.features.forEach((f: any) => {
          if (f.geometry.type === "LineString") {
            const projectedCoords = f.geometry.coordinates.map((pt: any) =>
              fromLonLat(pt)
            );
            for (let i = 1; i < projectedCoords.length; i++) {
              const c1 = projectedCoords[i - 1];
              const c2 = projectedCoords[i];
              const tramo = new Feature({
                geometry: new LineString([c1, c2]),
                id: id_tramo++,
              });
              tramo.setProperties(f.properties || {});
              callesSource.addFeature(tramo);
            }
          }
        });
      });

    const select = new Select({
      multi: true,
      style: new Style({
        stroke: new Stroke({
          color: "#FFD600",
          width: 8,
        }),
      }),
      condition: click,
      toggleCondition: always,
      addCondition: always,
      removeCondition: always,
    });

    select.on("select", (ev: any) => {
      const selectedFeatures = ev.target.getFeatures().getArray();
      const trayectoCoords: TrayectoMulti = selectedFeatures.map(
        (f: Feature) => {
          const geom = f.getGeometry() as LineString;
          const coords = geom.getCoordinates();
          return coords.map((coord) => toLonLat(coord));
        }
      );
      onTrayectoSeleccionado(trayectoCoords);
    });

    const map = new Map({
      target: mapDiv.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: callesSource,
          style: new Style({
            stroke: new Stroke({ color: "#38bdf8", width: 4 }),
          }),
        }),
      ],
      view: new View({
        center: formosaCenter,
        zoom: 14,
        extent: extentFormosa,
      }),
      controls: [],
      interactions: defaultInteractions().extend([select]),
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div
      ref={mapDiv}
      className="rounded-2xl border border-blue-200 mt-2"
      style={{ height: 320, width: "100%" }}
    />
  );
}

export function ParadasMap({
  trayecto,
  onParadasLista,
}: {
  trayecto: TrayectoMulti;
  onParadasLista: (f: Parada[]) => void;
  paradas?: ParadaCoords[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const trayectoSourceRef = useRef<VectorSource>(new VectorSource());
  const paradasSourceRef = useRef<VectorSource>(new VectorSource());
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    trayectoSourceRef.current.clear();
    trayecto.forEach((segmento) => {
      const geom = new LineString(segmento.map(coord => fromLonLat(coord)));
      trayectoSourceRef.current.addFeature(new Feature(geom));
    });

    if (!mapRef.current) {
      mapRef.current = new Map({
        target: ref.current,
        layers: [
          new TileLayer({ source: new OSM() }),
          new VectorLayer({
            source: trayectoSourceRef.current,
            style: new Style({
              stroke: new Stroke({ color: "#FFD600", width: 5 }),
            }),
          }),
          new VectorLayer({
            source: paradasSourceRef.current, 
            // @ts-ignore
            style: (feature, resolution) => 
              new Style({
                image: new CircleStyle({
                  radius: Math.max(2, 1 * 4 / resolution),
                  fill: new Fill({ color: "#e91e63" }),
                  stroke: new Stroke({ color: "#fff", width: 2 }),
                }),
              }),
          }),
        ],
        view: new View({ center: formosaCenter, zoom: 14 }),
        controls: [],
        interactions: defaultInteractions(),
      });

      mapRef.current.on("click", (evt: any) => {
        let minDist = 32, coord = null;
        trayectoSourceRef.current.getFeatures().forEach((f) => {
          const candidate = f.getGeometry()!.getClosestPoint(evt.coordinate);
          const dist = Math.hypot(candidate[0] - evt.coordinate[0], candidate[1] - evt.coordinate[1]);
          if (dist < minDist) {
            minDist = dist;
            coord = candidate;
          }
        });
        if (coord) {
          const parada = new Feature(new Point(coord));
          paradasSourceRef.current.addFeature(parada);
          onParadasLista(paradasSourceRef.current.getFeatures());

        }
      });
    }


    mapRef.current?.getView().setCenter(formosaCenter);
    mapRef.current?.getView().setZoom(14);

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
    };
  }, [trayecto]); 

  return (
    <div>
      <div className="mb-2 text-center text-blue-700 text-sm flex justify-center items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20" style={{display:"inline"}}><circle cx="10" cy="10" r="9" fill="#fde047" stroke="#eab308" strokeWidth="2"/><text x="10" y="15" textAnchor="middle" fontSize="13" fill="#334155" fontWeight="bold">i</text></svg>
        Tocá sobre la ruta amarilla para agregar una parada
      </div>
      <div
        ref={ref}
        className="rounded-2xl border border-blue-200 mt-2"
        style={{ height: 320, width: "100%" }}
      />
    </div>
  );
}

interface MapaTrayectoProps {
  paso: number;
  onChange?: (trayecto: TrayectoMulti, paradas?: Parada[]) => void;
  trayecto?: TrayectoMulti;
  paradas?: ParadaCoords[];
  readOnly?: boolean;
}
export function MapaTrayecto({ paso, onChange, trayecto, paradas, readOnly }: MapaTrayectoProps) {
  if (readOnly || paso === 99){
    return (
      <MapVisualizer trayecto={trayecto || []} paradas={paradas || []} />
    );
  }
  if (paso === 2) {
    return (
      <TrayectoMap
        onTrayectoSeleccionado={(trayectoCoords) => onChange?.(trayectoCoords)}
      />
    );
  }
  if (paso === 3) {
    return (
     <ParadasMap
        trayecto={trayecto || []}
        paradas={paradas || []}  
        onParadasLista={(stops) => onChange?.([], stops)}
      />
    );
  }
  return null;
}
