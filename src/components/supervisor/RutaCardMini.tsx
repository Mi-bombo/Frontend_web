import "ol/ol.css";
import { useRef, useEffect } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import LineString from "ol/geom/LineString";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";

export function RutaCardMini({
  linea,
  onEdit,
  onDelete,
  onView,
}: {
  linea: any;
  onEdit: (linea: any) => void;
  onDelete: (linea: any) => void;
  onView: (linea: any) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    // Normaliza trayecto de la línea
    const trayecto = Array.isArray(linea.trayecto)
      ? linea.trayecto
      : (linea.trayecto?.coordinates ?? []);
    const vector = new VectorSource();
    trayecto.forEach((segmento: number[][]) => {
      const geom = new LineString(
        segmento.map(([lon, lat]) => fromLonLat([lon, lat]))
      );
      vector.addFeature(new Feature(geom));
    });
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: vector,
          style: new Style({
            stroke: new Stroke({ color: "#1976d2", width: 7 }),
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([-58.1731, -26.1849]),
        zoom: 14,
      }),
      controls: [],
      interactions: [],
    });
    // Fit trayecto si existe
    if (trayecto.length > 0) {
      const coords = trayecto.flat();
      if (coords.length > 0) {
        const lonlats = coords.map(([lon, lat]: [number, number]) =>
          fromLonLat([lon, lat])
        );
        const extent = new LineString(lonlats).getExtent();
        map.getView().fit(extent, { maxZoom: 15, duration: 0 });
      }
    }
    return () => map.setTarget(undefined);
  }, [linea.trayecto]);

  return (
    <div
      className="rounded-2xl border-2 border-blue-100 bg-white shadow-lg w-80 flex flex-col hover:shadow-xl transition group cursor-pointer"
      onClick={() => onView(linea)}
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onView(linea); }}
      style={{ outline: "none" }}
    >
      {/* Mini-mapa */}
      <div className="h-56 rounded-t-2xl overflow-hidden relative" style={{ borderBottom: "2px solid #38bdf8" }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 200 }} />
        <button
          className="absolute top-2 right-2 bg-white bg-opacity-90 text-blue-700 px-4 py-1 rounded shadow font-bold opacity-0 group-hover:opacity-100 transition-all"
          onClick={e => { e.stopPropagation(); onView(linea); }}
        >
          Ver detalle
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-xl font-bold text-blue-800">{linea.nombre}</h3>
        <div className="text-blue-500 text-sm">
          Creado el{" "}
          <span className="font-semibold text-blue-800">
            {new Date(linea.fecha_creacion).toLocaleString("es-AR")}
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={e => { e.stopPropagation(); onEdit(linea); }}
            className="flex-1 px-3 py-1 bg-blue-50 border border-blue-300 rounded font-semibold text-blue-800 hover:bg-blue-200"
          >Editar</button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(linea); }}
            className="flex-1 px-3 py-1 bg-white border border-yellow-300 rounded font-semibold text-yellow-600 hover:bg-yellow-100"
          >Eliminar</button>
        </div>
      </div>
    </div>
  );
}
