import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, MapPin, Users, Star } from 'lucide-react';
import { pgService, bookingService } from '../services/api';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/Skeleton';
import { mockPGs } from '../data/mockData';

export default function OwnerDashboard() {
  const { user, showToast } = useApp();
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [deleteId, setDeleteId] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newPG, setNewPG] = useState({ title: '', city: '', area: '', price: '', type: 'coed' });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      pgService.getAll().then(data => setListings(data.slice(0, 3))),
      bookingService.getOwnerRequests().then(setRequests),
    ]).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await pgService.delete(id);
    setListings(l => l.filter(p => p._id !== id));
    setDeleteId(null);
    showToast('Listing deleted successfully', 'info');
  };

  const handleRequestAction = async (id, status) => {
    await bookingService.updateStatus(id, status);
    setRequests(r => r.map(req => req.id === id ? { ...req, status } : req));
    showToast(`Request ${status}`, status === 'approved' ? 'success' : 'info');
  };

  const handleAddPG = async () => {
    setAddLoading(true);
    try {
      const created = await pgService.create({ ...newPG, images: [mockPGs[0].images[0]], amenities: ['WiFi'], rating: 4.5, reviews: 0, available: true, type: newPG.type });
      setListings(l => [{ ...created, location: { city: newPG.city, area: newPG.area }, price: Number(newPG.price) }, ...l]);
      setAddModal(false);
      setNewPG({ title: '', city: '', area: '', price: '', type: 'coed' });
      showToast('PG listed successfully!', 'success');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Owner Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your PG listings and bookings</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setAddModal(true)}>Add New PG</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'My Listings', value: listings.length, icon: '🏠' },
          { label: 'Booking Requests', value: requests.length, icon: '📋' },
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, icon: '⏳' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl border border-white/5 p-5 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-display font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
        {[
          { id: 'listings', label: 'My Listings' },
          { id: 'requests', label: `Requests (${requests.filter(r => r.status === 'pending').length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState icon="🏠" title="No listings yet" description="Add your first PG to start accepting bookings."
            action={<Button onClick={() => setAddModal(true)} icon={<Plus size={16} />}>Add PG</Button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(pg => (
              <div key={pg._id} className="glass rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all">
                <div className="relative h-40">
                  <img src={pg.images[0]} alt={pg.title} className="w-full h-full object-cover" />
                  <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${pg.available ? 'bg-emerald-400' : 'bg-red-400'}`} />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-white">{pg.title}</p>
                  <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin size={12} />{pg.location?.area || pg.location?.city}, {pg.location?.city}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-brand-400 font-bold">₹{Number(pg.price).toLocaleString()}/mo</span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      <Star size={11} className="fill-amber-400" />{pg.rating}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" size="sm" className="flex-1" icon={<Edit size={13} />}>Edit</Button>
                    <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setDeleteId(pg._id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <EmptyState icon="📬" title="No booking requests" description="When tenants request to book your PG, they'll appear here." />
          ) : (
            requests.map(req => (
              <div key={req.id} className="glass rounded-2xl border border-white/5 p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400">{req.avatar}</div>
                    <div>
                      <p className="font-medium text-white">{req.tenant}</p>
                      <p className="text-xs text-slate-400">{req.email}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize ${
                    req.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                    req.status === 'pending' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                    'bg-red-400/10 text-red-400 border-red-400/20'
                  }`}>{req.status}</div>
                </div>
                <div className="mt-4 text-sm text-slate-400 space-y-1">
                  <p>PG: <span className="text-white">{req.pgTitle}</span></p>
                  <p>Room: <span className="text-white">{req.roomType}</span></p>
                  <p>Check-in: <span className="text-white">{req.checkIn}</span></p>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <Button variant="success" size="sm" icon={<Check size={14} />} onClick={() => handleRequestAction(req.id, 'approved')}>Accept</Button>
                    <Button variant="danger" size="sm" icon={<X size={14} />} onClick={() => handleRequestAction(req.id, 'rejected')}>Reject</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Listing" size="sm">
        <p className="text-slate-400 text-sm mb-5">Are you sure you want to delete this listing? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>

      {/* Add PG Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New PG Listing">
        <div className="space-y-4">
          {[
            { key: 'title', label: 'PG Name', placeholder: 'e.g. Sunrise Residency' },
            { key: 'city', label: 'City', placeholder: 'e.g. Bangalore' },
            { key: 'area', label: 'Area', placeholder: 'e.g. Koramangala' },
            { key: 'price', label: 'Starting Price (₹/month)', placeholder: 'e.g. 8000', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">{f.label}</label>
              <input type={f.type || 'text'} placeholder={f.placeholder} value={newPG[f.key]}
                onChange={e => setNewPG(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/50 placeholder-slate-600" />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Gender Preference</label>
            <select value={newPG.type} onChange={e => setNewPG(p => ({ ...p, type: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/50">
              <option value="coed" className="bg-slate-900">Co-ed</option>
              <option value="male" className="bg-slate-900">Male Only</option>
              <option value="female" className="bg-slate-900">Female Only</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={addLoading} onClick={handleAddPG}
              disabled={!newPG.title || !newPG.city || !newPG.price}>
              Add Listing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
