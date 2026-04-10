import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { fmtMoney, fmtNum, toOutOf10 } from "@/lib/format";
import { scoreColor, scoreLabel } from "@/lib/ratings";

function CityPopup({ city }) {
  const score = toOutOf10(city?.livabilityScore);
  const tone = scoreColor(score);
  const label = scoreLabel(score);
  return (
    <div className="min-w-[180px]">
      {/* Header */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold leading-tight text-slate-900">{city.name}</div>
          {city.state && <div className="mt-px text-[11px] text-slate-500">{city.state}</div>}
        </div>
        {label && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tone.pill}`}>
            {label}
          </span>
        )}
      </div>

      {/* Score */}
      <div className="mb-0.5 flex items-baseline gap-0.5">
        <span className="text-[26px] font-extrabold leading-none text-slate-900">
          {score ?? "N/A"}
        </span>
        <span className="text-[11px] text-slate-400">/10</span>
      </div>
      <div className="mb-2 text-[11px] text-slate-400">Overall livability</div>

      {/* Stats row */}
      <div className="mb-2.5 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-slate-100 pt-2">
        <div>
          <div className="text-[10px] text-slate-400">Safety</div>
          <div className="text-xs font-semibold text-slate-900">
            {city?.safetyScore != null ? `${fmtNum(city.safetyScore, { digits: 1 })}/10` : "N/A"}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Median rent</div>
          <div className="text-xs font-semibold text-slate-900">{fmtMoney(city?.medianRent)}</div>
        </div>
        {city?.reviewCount != null && (
          <div>
            <div className="text-[10px] text-slate-400">Reviews</div>
            <div className="text-xs font-semibold text-slate-900">{city.reviewCount}</div>
          </div>
        )}
      </div>

      <Link
        to={`/cities/${city.slug}`}
        className="text-xs font-semibold text-sky-600 hover:underline"
      >
        View details →
      </Link>
    </div>
  );
}

/** Leaflet map rendering filtered cities as markers with enriched popups. */
export default function CitiesMap({ cities = [] }) {
  const mapped = cities.filter(
    (city) => Number.isFinite(Number(city.lat)) && Number.isFinite(Number(city.lng)),
  );

  if (mapped.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        No cities have coordinates yet.
      </div>
    );
  }

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

        {mapped.map((city) => (
          <Marker key={city.slug} position={[Number(city.lat), Number(city.lng)]}>
            <Popup>
              <CityPopup city={city} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
