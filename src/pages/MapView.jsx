import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pgService } from '../services/api';
import Button from '../components/common/Button';
import StarRating from '../components/common/StarRating';

export default function MapView() {
  const [pgs, setPgs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [MapComponents, setMapComponents] = useState(null);

  useEffect(() => {
    pgService.getAll().then(setPgs);
    // Dynamically import Leaflet to avoid SSR issues
    import('react-leaflet').then(module => {
      setMapComponents({
        MapContainer: module.MapContainer,
        TileLayer: module.TileLayer,
        Marker: module.Marker,
        Popup: module.Popup,
        Circle: module.Circle,
        useMap: module.useMap,
      });
    });
  }, []);

  const handleNearMe = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        alert('Unable to get your location. Please enable location access.');
        setLocLoading(false);
      }
    );
  };

  const defaultCenter = [12.9716, 77.5946]; // Bangalore

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Map View</h1>
          <p className="text-slate-400 text-sm mt-1">{pgs.length} PGs plotted on map</p>
        </div>
        <Button
          variant="secondary"
          icon={<Navigation size={16} />}
          loading={locLoading}
          onClick={handleNearMe}
        >
          Near Me
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 h-[500px] rounded-2xl overflow-hidden border border-white/10">
          {MapComponents ? (
            <MapComponents.MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <MapComponents.TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {pgs.map(pg => (
                <MapComponents.Marker
                  key={pg.id}
                  position={[pg.location.lat, pg.location.lng]}
                  eventHandlers={{ click: () => setSelected(pg) }}
                >
                  <MapComponents.Popup>
                    <div className="text-slate-900 text-sm">
                      <strong>{pg.title}</strong><br />
                      ₹{pg.price.toLocaleString()}/month<br />
                      {pg.location.area}, {pg.location.city}
                    </div>
                  </MapComponents.Popup>
                </MapComponents.Marker>
              ))}
              {userLocation && (
                <MapComponents.Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={1000}
                  pathOptions={{ color: '#e55a28', fillOpacity: 0.1 }}
                />
              )}
            </MapComponents.MapContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-sm">
              Loading map…
            </div>
          )}
        </div>

        {/* PG List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {pgs.map(pg => (
            <div
              key={pg.id}
              onClick={() => setSelected(pg)}
              className={`glass rounded-xl border p-4 cursor-pointer transition-all hover:border-brand-500/40 ${
                selected?.id === pg.id ? 'border-brand-500/60 bg-brand-500/5' : 'border-white/5'
              }`}
            >
              <div className="flex gap-3">
                <img src={pg.images[0]} alt={pg.title} className="w-16 h-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{pg.title}</p>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />{pg.location.area}, {pg.location.city}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-brand-400 text-sm font-semibold">₹{pg.price.toLocaleString()}</span>
                    <StarRating rating={pg.rating} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected PG Detail Card */}
      {selected && (
        <div className="mt-6 glass rounded-2xl border border-brand-500/20 p-5 animate-slide-up">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <img src={selected.images[0]} alt={selected.title} className="w-24 h-20 rounded-xl object-cover shrink-0" />
              <div>
                <h3 className="font-semibold text-white text-lg">{selected.title}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={13} />{selected.location.area}, {selected.location.city}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-brand-400 font-bold text-lg">₹{selected.price.toLocaleString()}<span className="text-slate-500 text-xs">/mo</span></span>
                  <StarRating rating={selected.rating} reviews={selected.reviews} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to={`/pg/${selected.id}`}>
                <Button size="sm">View Details</Button>
              </Link>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
