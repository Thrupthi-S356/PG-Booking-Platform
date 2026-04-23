import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Coffee, Wind, WashingMachine, Shield, Car } from 'lucide-react';
import Button from './Button';

const amenityIcons = {
  WiFi: <Wifi size={12} />, Meals: <Coffee size={12} />, AC: <Wind size={12} />,
  Laundry: <WashingMachine size={12} />, Security: <Shield size={12} />, Parking: <Car size={12} />,
};

const typeColors = {
  male: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  female: 'bg-pink-500/20 text-pink-400 border-pink-500/20',
  coed: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
};

export default function PGCard({ pg }) {
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover group border border-white/5 hover:border-brand-500/30">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-800">
        <img
          src={pg.images[imgIdx]}
          alt={pg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=60'; }}
        />
        {/* Type badge */}
        <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full border backdrop-blur-sm capitalize ${typeColors[pg.type]}`}>
          {pg.type}
        </span>
        {/* Availability */}
        {!pg.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-red-500/80 px-4 py-1.5 rounded-full">Fully Occupied</span>
          </div>
        )}
        {/* Image dots */}
        {pg.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {pg.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-white text-base leading-tight">{pg.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">{pg.rating}</span>
            <span className="text-xs text-slate-500">({pg.reviews})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <MapPin size={12} />
          <span>{pg.location.area}, {pg.location.city}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pg.amenities.slice(0, 5).map((a) => (
            <span key={a} className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/5">
              {amenityIcons[a] || null}
              {a}
            </span>
          ))}
          {pg.amenities.length > 5 && (
            <span className="text-xs text-slate-500 px-2 py-1">+{pg.amenities.length - 5}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-brand-400 font-bold text-lg">₹{pg.price.toLocaleString()}</span>
            <span className="text-slate-500 text-xs">/month</span>
          </div>
          <Link to={`/pg/${pg._id}`}>
            <Button size="sm" variant={pg.available ? 'primary' : 'secondary'}>
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
