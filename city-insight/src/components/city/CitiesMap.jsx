import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";

export default function CitiesMap({ cities = [] }) {
  // Only keep cities that have valid coordinates
  const mapped = cities.filter(
    (c) => Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng)),
  );

  if (mapped.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        No cities have coordinates yet.
      </div>
    );
  }

  // Center the map on the first city
  const center = [Number(mapped[0].lat), Number(mapped[0].lng)];

  return (
    <div className="relative z-0 h-[500px] w-full overflow-hidden rounded-xl">
      <MapContainer
        className="z-0"
        center={center}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {mapped.map((c) => (
          <Marker key={c.slug} position={[Number(c.lat), Number(c.lng)]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{c.name}</div>
                {c.state ? (
                  <div className="text-slate-600">{c.state}</div>
                ) : null}
                <Link
                  to={`/cities/${c.slug}`}
                  className="text-sky-600 hover:underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
