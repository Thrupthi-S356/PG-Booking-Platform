

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pgService } from '../services/api';
import Button from '../components/common/Button';

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

// ── FlyToMarker — flies map to selected PG ───────────────────────────
function FlyToMarker({ position }) {
  const [useMap, setUseMap] = useState(null);
  useEffect(() => {
    import('react-leaflet').then(m => setUseMap(() => m.useMap));
  }, []);
  if (!useMap) return null;
  return <FlyToMarkerInner position={position} useMap={useMap} />;
}

function FlyToMarkerInner({ position, useMap }) {
  const map = useMap();
  useEffect(() => {
    if (map && position) {
      map.flyTo(position, 15, { duration: 1.2 });
    }
  }, [position?.[0], position?.[1]]);
  return null;
}

// ── Radius options ───────────────────────────────────────────────────
const RADIUS_OPTIONS = [
  { label: '2 km',   value: 2   },
  { label: '5 km',   value: 5   },
  { label: '25 km',  value: 25  },
  { label: '50 km',  value: 50  },
  { label: '100 km', value: 100 },
];

// Fallback center — only used when map first loads and no GPS yet
const FALLBACK_CENTER = [12.8942, 75.0085];

export default function MapView() {
  const [allPgs, setAllPgs]               = useState([]);
  const [displayPgs, setDisplayPgs]       = useState([]);
  const [selected, setSelected]           = useState(null);
  const [flyToPos, setFlyToPos]           = useState(null);
  const [userLocation, setUserLocation]   = useState(null);
  const [locLoading, setLocLoading]       = useState(false);
  const [nearMeActive, setNearMeActive]   = useState(false);
  const [radiusKm, setRadiusKm]           = useState(100);
  const [MapComponents, setMapComponents] = useState(null);

  // Map center: use user location if known, else fallback
  const activeCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : FALLBACK_CENTER;

  // ── Load PGs and Leaflet on mount ────────────────────────────────
  useEffect(() => {
    pgService.getAll().then(data => {
      const missing = data.filter(pg => !pg.location?.lat || !pg.location?.lng);
      if (missing.length > 0) {
        console.warn('⚠️ PGs with missing coordinates (will be skipped):', missing.map(p => p.title));
      }
      console.log('✅ PGs loaded:', data.length, '| valid coords:', data.length - missing.length);
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

  // ── Get validated coordinates for a PG (returns null if missing) ─
  const getCoords = (pg) => {
    const lat = pg.location?.lat;
    const lng = pg.location?.lng;
    if (!lat || !lng) return null;
    return { lat, lng };
  };

  // ── Filter nearby PGs ────────────────────────────────────────────
  const filterNearby = (pgs, location, radius) => {
    const withDistance = pgs
      .map(pg => {
        const coords = getCoords(pg);
        if (!coords) return null;
        return {
          ...pg,
          distanceKm: getDistanceKm(location.lat, location.lng, coords.lat, coords.lng),
        };
      })
      .filter(Boolean);

    const nearby = withDistance
      .filter(pg => pg.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    console.log('📍 Nearby PGs found:', nearby.length, 'within', radius, 'km of', location);
    setDisplayPgs(nearby);
  };

  // ── Click PG in list ─────────────────────────────────────────────
  const handlePGClick = (pg) => {
    const coords = getCoords(pg);
    if (!coords) return;

    const dist = userLocation
      ? getDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
      : null;

    setSelected({ ...pg, distanceKm: dist });
    setFlyToPos([coords.lat, coords.lng]);
  };

  // ── Near Me toggle ───────────────────────────────────────────────
  const handleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false);
      setDisplayPgs(allPgs);
      setSelected(null);
      setFlyToPos(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser');
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        console.log('📍 Fresh GPS location:', location);
        setUserLocation(location);
        setFlyToPos([location.lat, location.lng]);
        setNearMeActive(true);
        filterNearby(allPgs, location, radiusKm);
        setLocLoading(false);
      },
      err => {
        console.error('❌ Location error:', err.code, err.message);
        setLocLoading(false);
        if (err.code === 1) {
          alert('Location permission denied. Please allow location in browser settings and try again.');
        } else {
          alert('Unable to get location. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Radius change ────────────────────────────────────────────────
  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    if (userLocation && nearMeActive) filterNearby(allPgs, userLocation, newRadius);
  };

  const listPgs = nearMeActive ? displayPgs : allPgs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Map View</h1>
          <p className="text-slate-400 text-sm mt-1">
            {nearMeActive
              ? `${displayPgs.length} PG${displayPgs.length !== 1 ? 's' : ''} within ${radiusKm}km of you`
              : `${allPgs.length} PG${allPgs.length !== 1 ? 's' : ''} on map`}
          </p>
        </div>

        <div className="flex items-center gap-3">
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
              <span className="text-slate-400 ml-1">— none found, try a larger radius</span>
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
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              {flyToPos && <FlyToMarker position={flyToPos} />}

              <MapComponents.TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              {/* ── PG Markers ── */}
              {allPgs.map(pg => {
                const coords = getCoords(pg);
                if (!coords) return null;

                const { lat, lng } = coords;
                const isNearby = nearMeActive ? displayPgs.some(d => d._id === pg._id) : true;
                const dist = userLocation
                  ? getDistanceKm(userLocation.lat, userLocation.lng, lat, lng)
                  : null;

                return (
                  <MapComponents.Marker
                    key={pg._id}
                    position={[lat, lng]}
                    opacity={nearMeActive && !isNearby ? 0.25 : 1}
                    eventHandlers={{
                      click: () => {
                        setSelected({ ...pg, distanceKm: dist });
                        setFlyToPos([lat, lng]);
                      }
                    }}
                  >
                    <MapComponents.Popup>
                      <div style={{ minWidth: '180px', fontSize: '13px', lineHeight: '1.6' }}>
                        <strong style={{ fontSize: '14px' }}>{pg.title}</strong><br />
                        📍 {pg.location?.area}, {pg.location?.city}<br />
                        💰 ₹{pg.price?.toLocaleString()}/month<br />
                        {dist !== null && (
                          <span style={{ color: '#e55a28', fontWeight: 600 }}>
                            🚗 {dist.toFixed(1)} km away
                          </span>
                        )}
                        <br />
                        <span style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          padding: '2px 8px',
                          borderRadius: '99px',
                          fontSize: '11px',
                          background: pg.available ? '#dcfce7' : '#fee2e2',
                          color: pg.available ? '#166534' : '#991b1b',
                        }}>
                          {pg.available ? 'Available' : 'Occupied'}
                        </span>
                      </div>
                    </MapComponents.Popup>
                  </MapComponents.Marker>
                );
              })}

              {/* ── User location dot + radius ring ── */}
              {userLocation && nearMeActive && (
                <>
                  <MapComponents.Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={120}
                    pathOptions={{ color: '#e55a28', fillColor: '#e55a28', fillOpacity: 0.9 }}
                  />
                  <MapComponents.Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={radiusKm * 1000}
                    pathOptions={{ color: '#e55a28', fillOpacity: 0.05, dashArray: '8 4', weight: 2 }}
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
          {nearMeActive && displayPgs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-4xl mb-3">📍</p>
              <p className="text-white font-medium mb-1">No PGs nearby</p>
              <p className="text-slate-400 text-sm mb-4">
                No PGs found within {radiusKm}km of your location.
              </p>
              <button
                onClick={() => handleRadiusChange(25)}
                className="text-sm text-brand-400 hover:text-brand-300 underline"
              >
                Expand to 25km
              </button>
            </div>
          ) : (
            listPgs.map(pg => (
              <div
                key={pg._id}
                onClick={() => handlePGClick(pg)}
                className={`glass rounded-xl border p-4 cursor-pointer transition-all hover:border-brand-500/40 ${
                  selected?._id === pg._id ? 'border-brand-500/60 bg-brand-500/5' : 'border-white/5'
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
                      {pg.location?.area}, {pg.location?.city}
                    </p>
                    <span className="text-brand-400 text-sm font-semibold mt-1 block">
                      ₹{pg.price?.toLocaleString()}
                      <span className="text-slate-500 text-xs font-normal">/mo</span>
                    </span>
                    {pg.distanceKm !== undefined && pg.distanceKm !== null && (
                      <span
                        className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(229,90,40,0.15)', color: '#e55a28' }}
                      >
                        📍 {pg.distanceKm.toFixed(1)} km away
                      </span>
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
                  {selected.location?.area}, {selected.location?.city}
                </p>
                <span className="text-brand-400 font-bold text-lg mt-2 block">
                  ₹{selected.price?.toLocaleString()}
                  <span className="text-slate-500 text-xs font-normal">/mo</span>
                </span>
                {selected.distanceKm !== null && selected.distanceKm !== undefined && (
                  <span
                    className="inline-block mt-2 text-xs px-2 py-1 rounded-full"
                    style={{ background: 'rgba(229,90,40,0.15)', color: '#e55a28' }}
                  >
                    📍 {selected.distanceKm.toFixed(1)} km from your location
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link to={`/pg/${selected._id}`}>
                <Button size="sm">View Details</Button>
              </Link>
              <button
                onClick={() => { setSelected(null); setFlyToPos(null); }}
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

