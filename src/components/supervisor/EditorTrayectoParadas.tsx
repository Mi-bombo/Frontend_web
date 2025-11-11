import "ol/ol.css";
import { useRef, useEffect } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Feature, { type FeatureLike } from "ol/Feature";
import { defaults as defaultControls } from "ol/control";
import { defaults as defaultInteractions, Select } from "ol/interaction";
import { always, click } from "ol/events/condition";
import type { ParadaCoords } from "../../services/supervisor/rutasService";

type TrayectoMulti = number[][][];

// AGREGA { keyLinea } como prop, obligatorio que sea único p/ cada línea (idLinea, nombre, etc)
export function EditorTrayectoCallesYParadas({
  keyLinea,
  geojsonCalles,
  trayectoInicial,
  paradasInicial,
  modo = "trayecto",
  onChange,
}: {
  keyLinea: string | number;
  geojsonCalles: any;
  trayectoInicial: TrayectoMulti;
  paradasInicial: ParadaCoords[];
  modo?: "trayecto" | "paradas";
  onChange: (trayecto: TrayectoMulti, paradas: ParadaCoords[]) => void;
}) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const callesSource = useRef(new VectorSource());
  const paradasSource = useRef(new VectorSource());
  const selectRef = useRef<Select | null>(null);

  // Monta todo el mapa y capas, y limpia en cada cambio de línea (keyLinea)
  useEffect(() => {
    if (!mapDiv.current) return;
    if (mapDiv.current.childElementCount > 0) return;

    callesSource.current.clear();
    let id_tramo = 1;
    if (geojsonCalles?.features) {
      geojsonCalles.features.forEach((f: any) => {
        if (f.geometry?.type === "LineString" && Array.isArray(f.geometry.coordinates)) {
          const projectedCoords = f.geometry.coordinates.map((pt: any) =>
            (Array.isArray(pt) && pt.length === 2) ? fromLonLat([pt[0], pt[1]]) : [0, 0]
          );
          for (let i = 1; i < projectedCoords.length; i++) {
            const c1 = projectedCoords[i - 1];
            const c2 = projectedCoords[i];
            const tramo = new Feature({
              geometry: new LineString([c1, c2]),
              id: id_tramo++,
            });
            tramo.setProperties(f.properties || {});
            callesSource.current.addFeature(tramo);
          }
        }
      });
    }
    paradasSource.current.clear();

    const callesLayer = new VectorLayer({
      source: callesSource.current,
      style: (feature: FeatureLike) => {
        const isSelected =
          selectRef.current?.getFeatures().getArray().includes(feature as Feature) ?? false;
        return new Style({
          stroke: new Stroke({
            color: isSelected ? "#1976d2" : "#38bdf8",
            width: isSelected ? 7 : 4,
          }),
        });
      },
    });
    const paradasLayer = new VectorLayer({
      source: paradasSource.current,
      style: new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: "#FFD600" }),
          stroke: new Stroke({ color: "#FF4081", width: 2 }),
        }),
      }),
    });

    const map = new Map({
      target: mapDiv.current!,
      layers: [
        new TileLayer({ source: new OSM() }),
        callesLayer,
        paradasLayer,
      ],
      view: new View({
        center: fromLonLat([-58.1731, -26.1849]),
        zoom: 14,
      }),
      controls: defaultControls(),
      interactions: defaultInteractions(),
    });

    selectRef.current = new Select({
      multi: true,
      style: null,
      layers: [callesLayer],
      condition: click,
      toggleCondition: always,
      addCondition: always,
      removeCondition: always,
    });

    selectRef.current.on("select", () => {
      callesLayer.changed();
      const selected = selectRef.current!.getFeatures().getArray();
      const trayectoCoords: TrayectoMulti = selected.map(
        (f: Feature) => {
          const geom = f.getGeometry() as LineString;
          return geom.getCoordinates().map((coord) => toLonLat(coord));
        }
      );
      onChange(
        trayectoCoords,
        paradasSource.current.getFeatures().map(f => ({
          coords: toLonLat((f.getGeometry() as Point).getCoordinates()) as [number, number]
        }))
      );
    });

    map.addInteraction(selectRef.current);

    if (modo === "paradas") {
      map.on("singleclick", (evt) => {
        let minDist = 32, coord: number[] | null = null;
        selectRef.current!.getFeatures().getArray().forEach((f) => {
          const candidate = (f.getGeometry() as LineString).getClosestPoint(evt.coordinate);
          const dist = Math.hypot(candidate[0] - evt.coordinate[0], candidate[1] - evt.coordinate[1]);
          if (dist < minDist) {
            minDist = dist;
            coord = candidate;
          }
        });
        if (coord) {
          const parada = new Feature(new Point(coord));
          paradasSource.current.addFeature(parada);
          onChange(
            selectRef.current!.getFeatures().getArray().map(f =>
              (f.getGeometry() as LineString).getCoordinates().map(c => toLonLat(c))
            ),
            paradasSource.current.getFeatures().map(f => ({
              coords: toLonLat((f.getGeometry() as Point).getCoordinates()) as [number, number]
            }))
          );
        }
      });
    }

    // Paradas iniciales
    if (paradasInicial && paradasInicial.length) {
      paradasInicial.forEach(({ coords }) => {
        if (coords && coords.length === 2)
          paradasSource.current.addFeature(new Feature(new Point(fromLonLat([coords[0], coords[1]]))));
      });
    }

    // Limpieza total al desmontar
    return () => {
      map.setTarget(undefined);
      selectRef.current = null;
    };
  }, [geojsonCalles, keyLinea]); // <--- keyLinea hace re-mount si cambias de línea

  useEffect(() => {
    if (!selectRef.current) return;
    if (!trayectoInicial || !trayectoInicial.length) {
      selectRef.current.getFeatures().clear();
      return;
    }
    const featuresToSelect: Feature[] = [];
    callesSource.current.getFeatures().forEach((f: Feature) => {
      const geom = f.getGeometry() as LineString;
      trayectoInicial.forEach(seg => {
        if (
          seg.length === 2 &&
          ((Math.abs(geom.getCoordinates()[0][0] - fromLonLat([seg[0][0], seg[0][1]])[0]) < 1 &&
            Math.abs(geom.getCoordinates()[1][0] - fromLonLat([seg[1][0], seg[1][1]])[0]) < 1) ||
            (Math.abs(geom.getCoordinates()[1][0] - fromLonLat([seg[0][0], seg[0][1]])[0]) < 1 &&
              Math.abs(geom.getCoordinates()[0][0] - fromLonLat([seg[1][0], seg[1][1]])[0]) < 1))
        ) {
          featuresToSelect.push(f);
        }
      });
    });
    selectRef.current.getFeatures().clear();
    selectRef.current.getFeatures().extend(featuresToSelect);
  }, [trayectoInicial, geojsonCalles, keyLinea]);

  useEffect(() => {
    paradasSource.current.clear();
    if (paradasInicial && paradasInicial.length) {
      paradasInicial.forEach(({ coords }) => {
        if (coords && coords.length === 2)
          paradasSource.current.addFeature(new Feature(new Point(fromLonLat([coords[0], coords[1]]))));
      });
    }
  }, [paradasInicial, keyLinea]);

  // DIV del mapa con key única
  return (
    <div
      key={keyLinea}
      className="w-full h-[320px] rounded-2xl border border-blue-200 relative"
    >
      <div ref={mapDiv} style={{ width: "100%", height: "100%" }} tabIndex={0} />
    </div>
  );
}
