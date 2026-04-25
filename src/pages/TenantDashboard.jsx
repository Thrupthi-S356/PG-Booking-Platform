import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CheckCircle, Clock, XCircle, Ban, Home } from 'lucide-react';
import { bookingService } from '../services/api';
import { useApp } from '../context/AppContext';
import { SkeletonText } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const statusConfig = {
  approved: { label: 'Approved', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle },
  pending: { label: 'Pending', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
  rejected: { label: 'Rejected', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', icon: Ban },
};

export default function TenantDashboard() {
  const { user } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    bookingService.getMyBookings().then(setBookings).finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);
  const counts = { all: bookings.length, approved: bookings.filter(b => b.status === 'approved').length,
    pending: bookings.filter(b => b.status === 'pending').length, rejected: bookings.filter(b => b.status === 'rejected').length };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-xl font-bold">
            {user?.name?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">My Dashboard</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: counts.all, color: 'text-white' },
          { label: 'Approved', value: counts.approved, color: 'text-emerald-400' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-400' },
          { label: 'Rejected', value: counts.rejected, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl border border-white/5 p-4 text-center">
            <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
        {['all', 'approved', 'pending', 'rejected', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="glass rounded-2xl p-5 border border-white/5"><SkeletonText lines={3} /></div>)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📋" title="No bookings yet" description="Browse PGs and request a booking to get started."
          action={<Link to="/"><Button>Browse PGs</Button></Link>} />
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const { label, color, icon: Icon } = statusConfig[booking.status] || statusConfig.pending;
            return (
              <div key={booking.id} className="glass rounded-2xl border border-white/5 hover:border-white/10 transition-all overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* <img src={booking.image} alt={booking.pgTitle} className="w-full sm:w-36 h-32 sm:h-auto object-cover" /> */}
                  <img 
  src={booking.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80'} 
  alt={booking.pgTitle} 
  className="w-full sm:w-36 h-32 sm:h-auto object-cover"
  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80'; }}
/>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-semibold text-white text-base">{booking.pgTitle}</p>
                        <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                          <MapPin size={12} />{booking.pgLocation}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${color}`}>
                        <Icon size={12} />{label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5"><Home size={13} />{booking.roomType}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={13} />Move-in: {booking.checkIn}</span>
                      <span className="text-brand-400 font-semibold">₹{Number(booking.price || 0).toLocaleString()}/month</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-slate-500">Booking ID: {booking.id}</p>
                      <Link to={`/pg/${booking.pgId}`}>
                        <Button variant="ghost" size="sm">View PG →</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
