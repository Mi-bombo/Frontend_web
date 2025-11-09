import { useMemo, useState } from "react";
import L from "leaflet";
import type { LatLngExpression, LatLngTuple, DivIcon } from "leaflet";

export type ActiveSelection = "start" | "end" | null;

export const DEFAULT_CENTER: LatLngTuple = [-26.1833, -58.1833];
export const ROUTE_COLOR = "#2563eb";

export const formatDistance = (meters: number) =>
  meters >= 1000
    ? `${(meters / 1000).toFixed(2)} km`
    : `${meters.toFixed(0)} m`;

export const createPinIcon = (label: string, background: string): DivIcon =>
  L.divIcon({
    className: "",
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -34],
    html: `
      <div style="
        position: relative;
        width: 34px; height: 34px;
        border-radius: 9999px;
        background: ${background};
        color: white;
        font-weight: 800;
        display: grid; place-items: center;
        box-shadow: 0 10px 20px rgba(0,0,0,.25);
        border: 2px solid rgba(255,255,255,.9);
      ">
        ${label}
        <span style="
          position:absolute; left:50%; transform:translateX(-50%);
          bottom:-8px; width:0; height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid ${background};
          filter: drop-shadow(0 2px 2px rgba(0,0,0,.25));
        "></span>
      </div>
    `,
  });

export const useRoutePlanner = () => {
  const [startPoint, setStartPoint] = useState<LatLngTuple | null>(null);
  const [endPoint, setEndPoint] = useState<LatLngTuple | null>(null);
  const [activeSelection, setActiveSelection] =
    useState<ActiveSelection>("start");

  const startIcon = useMemo(() => createPinIcon("A", "#10b981"), []);
  const endIcon = useMemo(() => createPinIcon("B", "#ef4444"), []);

  const handleSelectPoint = (coords: LatLngTuple) => {
    if (activeSelection === "start") {
      setStartPoint(coords);
      setActiveSelection("end");
      return;
    }

    if (activeSelection === "end") {
      setEndPoint(coords);
      setActiveSelection(null);
    }
  };

  const distance = useMemo(() => {
    if (!startPoint || !endPoint) {
      return null;
    }
    return L.latLng(startPoint as LatLngExpression).distanceTo(
      L.latLng(endPoint as LatLngExpression)
    );
  }, [startPoint, endPoint]);

  const resetRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setActiveSelection("start");
  };

  const statusMessage =
    activeSelection === "start"
      ? "Hacé clic en el mapa para fijar el inicio (A)"
      : activeSelection === "end"
        ? "Hacé clic en el mapa para fijar el destino (B)"
        : null;

  return {
    startPoint,
    endPoint,
    activeSelection,
    setActiveSelection,
    handleSelectPoint,
    resetRoute,
    distance,
    startIcon,
    endIcon,
    statusMessage,
  };
};

export type UseRoutePlannerReturn = ReturnType<typeof useRoutePlanner>;
