
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pgService } from '../services/api';
import Button from '../components/common/Button';
import StarRating from '../components/common/StarRating';

// ── Distance calculator ──────────────────────────────────────────────
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── RecenterMap — must be outside main component ─────────────────────
function RecenterMap({ center }) {
  const [useMap, setUseMap] = useState(null);
  useEffect(() => {
    import('react-leaflet').then(m => setUseMap(() => m.useMap));
  }, []);
  if (!useMap) return null;
  return <RecenterMapInner center={center} useMap={useMap} />;
}

function RecenterMapInner({ center, useMap }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) map.flyTo(center, 13, { duration: 1.5 });
  }, [center[0], center[1]]);
  return null;
}

// ── Radius options ───────────────────────────────────────────────────
const RADIUS_OPTIONS = [
  { label: '2 km',  value: 2  },
  { label: '5 km',  value: 5  },
  { label: '10 km', value: 10 },
  { label: '15 km', value: 15 },
  { label: '25 km', value: 25 },
];

export default function MapView() {
  const [allPgs, setAllPgs]         = useState([]);
  const [displayPgs, setDisplayPgs] = useState([]);
  const [selected, setSelected]     = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [radiusKm, setRadiusKm]     = useState(10);
  const [MapComponents, setMapComponents] = useState(null);

  const defaultCenter = [12.9716, 77.5946]; // Bangalore
  const activeCenter  = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  // ── Initial load ────────────────────────────────────────────────────
  useEffect(() => {
    pgService.getAll().then(data => {
      setAllPgs(data);
      setDisplayPgs(data);
    });
    import('react-leaflet').then(module => {
      setMapComponents({
        MapContainer: module.MapContainer,
        TileLayer:    module.TileLayer,
        Marker:       module.Marker,
        Popup:        module.Popup,
        Circle:       module.Circle,
      });
    });
  }, []);

  // ── Poll every 30s ──────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      pgService.getAll().then(data => {
        setAllPgs(data);
        if (nearMeActive && userLocation) {
          filterNearby(data, userLocation, radiusKm);
        } else {
          setDisplayPgs(data);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [nearMeActive, userLocation, radiusKm]);

  // ── Filter by radius ────────────────────────────────────────────────
  const filterNearby = (pgs, location, radius) => {
    const nearby = pgs
      .filter(pg => pg.location?.lat && pg.location?.lng)
      .map(pg => ({
        ...pg,
        distanceKm: getDistanceKm(
          location.lat, location.lng,
          pg.location.lat, pg.location.lng
        ),
      }))
      .filter(pg => pg.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    setDisplayPgs(nearby);
  };

  // ── Near Me toggle ──────────────────────────────────────────────────
  const handleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false);
      setUserLocation(null);
      setDisplayPgs(allPgs);
      setSelected(null);
      return;
    }
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(location);
        setNearMeActive(true);
        filterNearby(allPgs, location, radiusKm);
        setLocLoading(false);
      },
      () => {
        alert('Unable to get your location. Please enable location access.');
        setLocLoading(false);
      },
      {
    enableHighAccuracy: true,  
    timeout: 10000,
    maximumAge: 0             
  }
    );
  };

  // ── Radius change ───────────────────────────────────────────────────
  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    if (userLocation) filterNearby(allPgs, userLocation, newRadius);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Map View</h1>
          <p className="text-slate-400 text-sm mt-1">
            {nearMeActive
              ? `${displayPgs.length} PG${displayPgs.length !== 1 ? 's' : ''} within ${radiusKm}km of you`
              : `${displayPgs.length} PG${displayPgs.length !== 1 ? 's' : ''} plotted on map`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Radius selector — only visible when Near Me is active */}
          {nearMeActive && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
              <Navigation size={13} className="text-brand-400 shrink-0" />
              <span className="text-xs text-slate-400">Radius:</span>
              <select
                value={radiusKm}
                onChange={e => handleRadiusChange(Number(e.target.value))}
                className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
              >
                {RADIUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant={nearMeActive ? 'primary' : 'secondary'}
            icon={<Navigation size={16} />}
            loading={locLoading}
            onClick={handleNearMe}
          >
            {nearMeActive ? 'Clear' : 'Near Me'}
          </Button>
        </div>
      </div>

      {/* ── Near Me banner ── */}
      {nearMeActive && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-sm flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-brand-400">
            <Navigation size={14} />
            Showing PGs within <strong>{radiusKm}km</strong> of your location
            {displayPgs.length === 0 && (
              <span className="text-slate-400 ml-1">
                — none found, try a larger radius
              </span>
            )}
          </div>
          {displayPgs.length === 0 && (
            <button
              onClick={() => handleRadiusChange(25)}
              className="text-xs text-brand-400 underline hover:text-brand-300"
            >
              Expand to 25km
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Map ── */}
        <div className="lg:col-span-2 h-[500px] rounded-2xl overflow-hidden border border-white/10">
          {MapComponents ? (
            <MapComponents.MapContainer
              center={activeCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <RecenterMap center={activeCenter} />

              <MapComponents.TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              {/* All PG markers — dim ones outside radius */}
              {allPgs
                .filter(pg => pg.location?.lat && pg.location?.lng)
                .map(pg => {
                  const isNearby = nearMeActive
                    ? displayPgs.some(d => d._id === pg._id)
                    : true;
                  const dist = nearMeActive && userLocation
                    ? getDistanceKm(userLocation.lat, userLocation.lng, pg.location.lat, pg.location.lng)
                    : null;
                  return (
                    <MapComponents.Marker
                      key={pg._id}
                      position={[pg.location.lat, pg.location.lng]}
                      opacity={nearMeActive && !isNearby ? 0.25 : 1}
                      eventHandlers={{ click: () => setSelected({ ...pg, distanceKm: dist }) }}
                    >
                      <MapComponents.Popup>
                        <div className="text-slate-900 text-sm min-w-[160px]">
                          <strong>{pg.title}</strong><br />
                          ₹{pg.price.toLocaleString()}/month<br />
                          {pg.location.area}, {pg.location.city}
                          {dist !== null && (
                            <><br />
                              <span style={{ color: '#e55a28', fontWeight: 600 }}>
                                 {dist.toFixed(1)} km away
                              </span>
                            </>
                          )}
                        </div>
                      </MapComponents.Popup>
                    </MapComponents.Marker>
                  );
                })}

              {/* User location — dot + radius ring */}
              {userLocation && (
                <>
                  <MapComponents.Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={120}
                    pathOptions={{
                      color: '#e55a28',
                      fillColor: '#e55a28',
                      fillOpacity: 0.9,
                    }}
                  />
                  <MapComponents.Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={radiusKm * 1000}
                    pathOptions={{
                      color: '#e55a28',
                      fillOpacity: 0.05,
                      dashArray: '8 4',
                      weight: 2,
                    }}
                  />
                </>
              )}
            </MapComponents.MapContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-sm">
              Loading map…
            </div>
          )}
        </div>

        {/* ── PG List ── */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">

          {/* Empty state when near me finds nothing */}
          {nearMeActive && displayPgs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-4xl mb-3">📍</p>
              <p className="text-white font-medium mb-1">No PGs nearby</p>
              <p className="text-slate-400 text-sm mb-4">
                No PGs found within {radiusKm}km of your location.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleRadiusChange(25)}
                  className="text-sm text-brand-400 hover:text-brand-300 underline"
                >
                  Expand to 25km
                </button>
                <button
                  onClick={() => { setNearMeActive(false); setUserLocation(null); setDisplayPgs(allPgs); }}
                  className="text-sm text-slate-400 hover:text-white underline"
                >
                  Show all PGs
                </button>
              </div>
            </div>
          ) : (
            displayPgs.map(pg => (
              <div
                key={pg._id}
                onClick={() => setSelected(pg)}
                className={`glass rounded-xl border p-4 cursor-pointer transition-all hover:border-brand-500/40 ${
                  selected?._id === pg._id
                    ? 'border-brand-500/60 bg-brand-500/5'
                    : 'border-white/5'
                }`}
              >
                <div className="flex gap-3">
                  <img
                    src={pg.images?.[0]}
                    alt={pg.title}
                    className="w-16 h-14 rounded-lg object-cover shrink-0"
                    onError={e => {
                      e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=60';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{pg.title}</p>
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {pg.location.area}, {pg.location.city}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-brand-400 text-sm font-semibold">
                        ₹{pg.price.toLocaleString()}
                      </span>
                      <StarRating rating={pg.rating} size="sm" />
                    </div>
                    {/* Distance badge */}
                    {pg.distanceKm !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(229,90,40,0.15)',
                            color: '#e55a28',
                          }}
                        >
                         {pg.distanceKm.toFixed(1)} km away
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Selected PG detail card ── */}
      {selected && (
        <div className="mt-6 glass rounded-2xl border border-brand-500/20 p-5 animate-slide-up">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex gap-4">
              <img
                src={selected.images?.[0]}
                alt={selected.title}
                className="w-24 h-20 rounded-xl object-cover shrink-0"
                onError={e => {
                  e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=60';
                }}
              />
              <div>
                <h3 className="font-semibold text-white text-lg">{selected.title}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={13} />
                  {selected.location.area}, {selected.location.city}
                </p>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="text-brand-400 font-bold text-lg">
                    ₹{selected.price.toLocaleString()}
                    <span className="text-slate-500 text-xs font-normal">/mo</span>
                  </span>
                  <StarRating rating={selected.rating} reviews={selected.reviews} />
                </div>
                {selected.distanceKm !== null && selected.distanceKm !== undefined && (
                  <span
                    className="inline-block mt-2 text-xs px-2 py-1 rounded-full"
                    style={{ background: 'rgba(229,90,40,0.15)', color: '#e55a28' }}
                  >
                     {selected.distanceKm.toFixed(1)} km from your location
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link to={`/pg/${selected._id}`}>
                <Button size="sm">View Details</Button>
              </Link>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}