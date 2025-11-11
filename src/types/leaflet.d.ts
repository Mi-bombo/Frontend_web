declare module "leaflet" {
  export type LatLngTuple = [number, number];

  export interface LatLng {
    distanceTo(target: LatLngExpression): number;
  }

  export type LatLngExpression =
    | LatLngTuple
    | { lat: number; lng: number }
    | LatLng;

  export interface DivIcon {
    options: Record<string, unknown>;
  }

  export function divIcon(options: Record<string, unknown>): DivIcon;

  export function latLng(value: LatLngExpression): LatLng;

  const L: {
    divIcon: typeof divIcon;
    latLng: typeof latLng;
  };

  export default L;
}
