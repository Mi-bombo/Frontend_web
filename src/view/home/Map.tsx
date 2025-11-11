// import {
//   MapContainer,
//   Marker,
//   Polyline,
//   Popup,
//   TileLayer,
//   useMap,
//   useMapEvents,
// } from "react-leaflet";
// import { useEffect, type ReactNode } from "react";
// import L, { type LatLngTuple } from "leaflet";
// import { AnimatePresence, motion } from "framer-motion";
// import { Flag, MapPin, RotateCcw, Ruler } from "lucide-react";
// import "leaflet/dist/leaflet.css";

// import {
//   DEFAULT_CENTER,
//   ROUTE_COLOR,
//   formatDistance,
//   useRoutePlanner,
// } from "./useRoutePlanner";

// const MapClickHandler = ({
//   onSelect,
// }: {
//   onSelect: (coords: LatLngTuple) => void;
// }) => {
//   useMapEvents({
//     click(event) {
//       onSelect([event.latlng.lat, event.latlng.lng]);
//     },
//   });

//   return null;
// };

// const RouteOverlay = ({
//   start,
//   end,
// }: {
//   start: LatLngTuple | null;
//   end: LatLngTuple | null;
// }) => {
//   const map = useMap();

//   useEffect(() => {
//     if (!start || !end) {
//       return;
//     }

//     const bounds = L.latLngBounds([start, end]).pad(0.25);
//     map.fitBounds(bounds, { animate: true });
//   }, [start, end, map]);

//   if (!start || !end) {
//     return null;
//   }

//   return (
//     <Polyline
//       positions={[start, end]}
//       color={ROUTE_COLOR}
//       opacity={0.9}
//       weight={6}
//       dashArray="10 14"
//     />
//   );
// };

// const Pill = ({ children }: { children: ReactNode }) => (
//   <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-white/15">
//     {children}
//   </div>
// );

// const ControlButton = ({
//   active,
//   disabled,
//   onClick,
//   icon,
//   label,
// }: {
//   active?: boolean;
//   disabled?: boolean;
//   onClick?: () => void;
//   icon: ReactNode;
//   label: string;
// }) => (
//   <motion.button
//     whileTap={{ scale: disabled ? 1 : 0.96 }}
//     whileHover={{ scale: disabled ? 1 : 1.02 }}
//     onClick={onClick}
//     disabled={disabled}
//     className={[
//       "group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
//       disabled
//         ? "cursor-not-allowed bg-white/10 text-blue-100/60 ring-1 ring-white/10"
//         : active
//         ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
//         : "bg-white/10 text-blue-100 hover:bg-white/20 ring-1 ring-white/10",
//     ].join(" ")}
//   >
//     <span className="opacity-90">{icon}</span>
//     {label}
//   </motion.button>
// );

// const LeafletMap = () => {
//   const {
//     startPoint,
//     endPoint,
//     activeSelection,
//     setActiveSelection,
//     handleSelectPoint,
//     resetRoute,
//     distance,
//     startIcon,
//     endIcon,
//     statusMessage,
//   } = useRoutePlanner();

//   return (
//     <section className="min-h-screen bg-slate-950/5 py-24">
//       <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 lg:flex-row">
//         <aside className="flex w-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-white shadow-2xl shadow-blue-900/30 backdrop-blur lg:max-w-sm">
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-200/80">
//                 Planificador de ruta
//               </p>
//               <h2 className="text-2xl font-semibold text-white">
//                 Control desde la barra lateral
//               </h2>
//               <p className="text-sm text-blue-100/80">
//                 Seleccioná los puntos de inicio y destino para obtener la
//                 distancia estimada entre ellos.
//               </p>
//               <div className="mt-3 flex flex-wrap items-center gap-2">
//                 <Pill>
//                   <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
//                   Inicio (A)
//                 </Pill>
//                 <Pill>
//                   <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-rose-400" />
//                   Destino (B)
//                 </Pill>
//                 <Pill>
//                   <Ruler className="mr-1 inline-block h-3.5 w-3.5" />
//                   Distancia aprox.
//                 </Pill>
//               </div>
//             </div>

//             <div className="flex flex-col gap-2">
//               <ControlButton
//                 active={activeSelection === "start"}
//                 onClick={() => setActiveSelection("start")}
//                 icon={<MapPin className="h-4 w-4" />}
//                 label="Fijar inicio"
//               />
//               <ControlButton
//                 active={activeSelection === "end"}
//                 onClick={() => setActiveSelection("end")}
//                 disabled={!startPoint}
//                 icon={<Flag className="h-4 w-4" />}
//                 label="Fijar destino"
//               />
//               <ControlButton
//                 onClick={resetRoute}
//                 disabled={!startPoint && !endPoint}
//                 icon={<RotateCcw className="h-4 w-4" />}
//                 label="Reiniciar"
//               />
//             </div>

//             <div className="space-y-3 rounded-2xl bg-white/5 p-4 text-sm text-blue-100/90 ring-1 ring-white/10">
//               <div className="flex items-start gap-3">
//                 <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/30">
//                   A
//                 </span>
//                 <div>
//                   <p className="text-xs uppercase tracking-wide text-blue-200/70">
//                     Inicio
//                   </p>
//                   <p className="font-semibold text-blue-50">
//                     {startPoint
//                       ? `${startPoint[0].toFixed(4)}, ${startPoint[1].toFixed(
//                           4
//                         )}`
//                       : "Seleccioná el primer punto en el mapa."}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-500/30">
//                   B
//                 </span>
//                 <div>
//                   <p className="text-xs uppercase tracking-wide text-blue-200/70">
//                     Destino
//                   </p>
//                   <p className="font-semibold text-blue-50">
//                     {endPoint
//                       ? `${endPoint[0].toFixed(4)}, ${endPoint[1].toFixed(4)}`
//                       : startPoint
//                         ? "Ahora seleccioná el destino."
//                         : "Esperando punto inicial."}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-6 space-y-3 text-xs text-blue-100/70">
//             <p className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
//               Tip: podés alternar entre inicio y destino en cualquier momento
//               usando los botones de esta barra lateral.
//             </p>
//             {distance && (
//               <p className="rounded-2xl bg-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-100 shadow-inner shadow-blue-500/10">
//                 Distancia aproximada: {formatDistance(distance)}
//               </p>
//             )}
//           </div>
//         </aside>

//         <div className="relative flex-1 overflow-hidden rounded-3xl border border-blue-100/20 shadow-[0_20px_40px_-12px_rgba(37,99,235,0.35)]">
//           <MapContainer
//             center={DEFAULT_CENTER}
//             zoom={14}
//             className="h-[520px] w-full"
//             scrollWheelZoom
//           >
//             <TileLayer
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               attribution="&copy; OpenStreetMap contributors"
//             />

//             <Marker position={DEFAULT_CENTER}>
//               <Popup>Ubicación SmartParking</Popup>
//             </Marker>

//             {startPoint && (
//               <Marker position={startPoint} icon={startIcon}>
//                 <Popup>Punto de inicio (A)</Popup>
//               </Marker>
//             )}

//             {endPoint && (
//               <Marker position={endPoint} icon={endIcon}>
//                 <Popup>Destino (B)</Popup>
//               </Marker>
//             )}

//             <RouteOverlay start={startPoint} end={endPoint} />
//             <MapClickHandler onSelect={handleSelectPoint} />
//           </MapContainer>

//           <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

//           <AnimatePresence>
//             {statusMessage && (
//               <motion.div
//                 initial={{ y: 12, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: 12, opacity: 0 }}
//                 className="pointer-events-none absolute bottom-5 left-5 z-[1000] rounded-2xl bg-slate-900/80 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur"
//               >
//                 {statusMessage}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <AnimatePresence>
//             {distance && (
//               <motion.div
//                 initial={{ y: 12, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: 12, opacity: 0 }}
//                 className="pointer-events-none absolute bottom-5 right-5 z-[1000] rounded-2xl bg-white/90 px-4 py-2 text-xs font-bold text-slate-900 shadow-xl"
//               >
//                 <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-600" />
//                 {formatDistance(distance)}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default LeafletMap;
