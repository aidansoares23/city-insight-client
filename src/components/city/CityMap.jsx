import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

/** Opens the given coordinates in Google Maps in a new tab. */
function openInGoogleMaps(lat, lng) {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Single-city Leaflet map with a title bar, coordinate display, and "Open in Maps" button. Returns null if coordinates are missing. */
export default function CityMap({ cityName, state, lat, lng, zoom = 11 }) {
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  if (!hasCoords) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">
            {cityName}
            {state ? `, ${state}` : ""}
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => openInGoogleMaps(lat, lng)}
          className="shrink-0 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-foreground/30 hover:text-foreground"
        >
          Open in Maps
        </button>
      </div>

      <div className="relative z-0 h-[300px] w-full">
        <MapContainer
          className="z-0"
          center={[lat, lng]}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <Marker position={[lat, lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{cityName}</div>
                {state ? <div className="text-muted-foreground">{state}</div> : null}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
