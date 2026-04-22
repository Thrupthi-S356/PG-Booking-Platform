import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, Coffee, Wind, Shield, Car, WashingMachine, ChevronLeft, ChevronRight, Phone, Calendar, CheckCircle, Dumbbell, Camera, Zap, Home } from 'lucide-react';
import { pgService, bookingService } from '../services/api';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import StarRating from '../components/common/StarRating';
import Spinner from '../components/common/Skeleton';

const amenityIcons = {
  WiFi: Wifi, Meals: Coffee, AC: Wind, Laundry: WashingMachine,
  Security: Shield, Parking: Car, Gym: Dumbbell, CCTV: Camera,
  'Power Backup': Zap, Housekeeping: Home,
};

const mockReviews = [
  { id: 1, name: 'Aryan Kapoor', rating: 5, date: 'Jan 2024', text: 'Amazing place! The amenities are top-notch and the owner is very cooperative. Highly recommend for working professionals.', avatar: 'AK' },
  { id: 2, name: 'Sneha Patel', rating: 4, date: 'Dec 2023', text: 'Good location and clean rooms. Meals are homely and delicious. Minor issues with WiFi speed but overall a great stay.', avatar: 'SP' },
  { id: 3, name: 'Rohan Desai', rating: 5, date: 'Nov 2023', text: 'Best PG I have stayed in. Very safe, 24/7 security, and the community is friendly. Totally worth the price.', avatar: 'RD' },
];

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, showToast } = useApp();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ roomType: '', checkIn: '', message: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    pgService.getById(id).then(setPg).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setBookingLoading(true);
    try {
      await bookingService.requestBooking(pg.id, bookingForm);
      setBookingModal(false);
      showToast('Booking request sent! Owner will respond shortly.', 'success');
    } catch {
      showToast('Booking failed. Try again.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!pg) return null;

  const prevImg = () => setImgIdx(i => (i - 1 + pg.images.length) % pg.images.length);
  const nextImg = () => setImgIdx(i => (i + 1) % pg.images.length);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-800 h-80 md:h-96 group">
            <img src={pg.images[imgIdx]} alt={pg.title} className="w-full h-full object-cover" />
            {pg.images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {pg.images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`rounded-full transition-all ${i === imgIdx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {pg.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-brand-400' : 'border-white/20'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* Title & Rating */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-bold text-white mb-2">{pg.title}</h1>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={15} />
                  <span>{pg.location.area}, {pg.location.city}</span>
                  <span className="capitalize px-2 py-0.5 text-xs rounded-full bg-white/10 text-slate-300">{pg.type}</span>
                </div>
              </div>
              <StarRating rating={pg.rating} reviews={pg.reviews} size="lg" />
            </div>
          </div>

          {/* Description */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h2 className="font-semibold text-white mb-3">About This PG</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{pg.description}</p>
          </div>

          {/* Amenities */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h2 className="font-semibold text-white mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pg.amenities.map(a => {
                const Icon = amenityIcons[a] || CheckCircle;
                return (
                  <div key={a} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center">
                      <Icon size={15} className="text-brand-400" />
                    </div>
                    <span className="text-sm text-slate-300">{a}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room Types */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h2 className="font-semibold text-white mb-4">Room Options</h2>
            <div className="space-y-3">
              {pg.rooms.map(room => (
                <div key={room.type} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/8 transition-colors">
                  <div>
                    <p className="text-white font-medium">{room.type}</p>
                    <p className="text-sm text-slate-400">{room.available} bed{room.available !== 1 ? 's' : ''} available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-400 font-bold">₹{room.price.toLocaleString()}<span className="text-slate-500 text-xs font-normal">/mo</span></p>
                    <p className={`text-xs mt-0.5 ${room.available > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {room.available > 0 ? 'Available' : 'Full'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h2 className="font-semibold text-white mb-4">Reviews ({pg.reviews})</h2>
            <div className="space-y-4">
              {mockReviews.map(r => (
                <div key={r.id} className="border-b border-white/5 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white shrink-0">{r.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{r.name}</p>
                        <span className="text-xs text-slate-500">{r.date}</span>
                      </div>
                      <div className="flex items-center gap-1 my-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />)}
                      </div>
                      <p className="text-sm text-slate-400">{r.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 glass rounded-2xl border border-white/10 p-6 space-y-5">
            <div>
              <p className="text-slate-400 text-sm">Starting from</p>
              <p className="text-3xl font-bold text-brand-400 font-display">₹{pg.price.toLocaleString()}<span className="text-slate-500 text-base font-normal">/month</span></p>
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${pg.available ? 'text-emerald-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${pg.available ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {pg.available ? 'Rooms Available' : 'Fully Occupied'}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!pg.available}
              onClick={() => isAuthenticated ? setBookingModal(true) : navigate('/login')}
            >
              {isAuthenticated ? 'Request Booking' : 'Sign in to Book'}
            </Button>

            <div className="border-t border-white/5 pt-4 space-y-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Owner Details</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center font-bold text-brand-400">
                  {pg.owner.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{pg.owner.name}</p>
                  <p className="text-xs text-slate-400">Member since {pg.owner.since}</p>
                </div>
              </div>
              <a href={`tel:${pg.owner.phone}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                <Phone size={14} className="text-brand-400" /> {pg.owner.phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Request Booking">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">{pg.title} · {pg.location.area}, {pg.location.city}</p>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Room Type</label>
            <select value={bookingForm.roomType} onChange={e => setBookingForm(f => ({ ...f, roomType: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/50">
              <option value="" className="bg-slate-900">Select a room type</option>
              {pg.rooms.filter(r => r.available > 0).map(r => (
                <option key={r.type} value={r.type} className="bg-slate-900">{r.type} — ₹{r.price}/month</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Preferred Move-in Date</label>
            <input type="date" value={bookingForm.checkIn} onChange={e => setBookingForm(f => ({ ...f, checkIn: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/50" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Message (optional)</label>
            <textarea value={bookingForm.message} onChange={e => setBookingForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Any questions or requirements..." rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/50 resize-none placeholder-slate-600" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setBookingModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={bookingLoading} onClick={handleBook} disabled={!bookingForm.roomType || !bookingForm.checkIn}>
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
