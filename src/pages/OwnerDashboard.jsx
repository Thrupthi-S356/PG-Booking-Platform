

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, MapPin, Star } from 'lucide-react';
import { pgService, bookingService, uploadService } from '../services/api'; // ✅ import uploadService
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/Skeleton';

const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/50 placeholder-slate-600";

const Field = ({ label, children }) => (
  <div>
    {label && <label className="text-sm font-medium text-slate-300 mb-1.5 block">{label}</label>}
    {children}
  </div>
);

const RoomRow = ({ room, onChange }) => (
  <div className="grid grid-cols-3 gap-3">
    <div>
      <label className="text-xs text-slate-400 mb-1 block">Room type</label>
      <select value={room.type} onChange={e => onChange('type', e.target.value)} className={inp}>
        <option value="Single" className="bg-slate-900">Single</option>
        <option value="Double Sharing" className="bg-slate-900">Double Sharing</option>
        <option value="Triple Sharing" className="bg-slate-900">Triple Sharing</option>
      </select>
    </div>
    <div>
      <label className="text-xs text-slate-400 mb-1 block">Price (₹/mo)</label>
      <input type="number" placeholder="6000" value={room.price}
        onChange={e => onChange('price', e.target.value)} className={inp} />
    </div>
    <div>
      <label className="text-xs text-slate-400 mb-1 block">Beds available</label>
      <input type="number" placeholder="2" value={room.available}
        onChange={e => onChange('available', e.target.value)} className={inp} />
    </div>
  </div>
);

// ✅ ImageUploader — uses multer upload route
const ImageUploader = ({ images, setData }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const imageList = Array.isArray(images) ? images : [];

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const tooBig = files.filter(f => f.size > 5 * 1024 * 1024);
    if (tooBig.length) { setError('Some files exceed 5MB limit'); return; }
    setError('');
    setUploading(true);
    try {
      const urls = await uploadService.uploadImages(files);
      setData(p => ({ ...p, images: [...imageList, ...urls] }));
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (idx, url) => {
    setData(p => ({ ...p, images: imageList.filter((_, i) => i !== idx) }));
    try { await uploadService.deleteImage(url); } catch {}
  };

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {imageList.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {imageList.map((url, idx) => (
            <div key={idx} className="relative group" style={{ aspectRatio: '16/9' }}>
              <img
                src={url} alt=""
                className="w-full h-full object-cover rounded-lg"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=60'; }}
              />
              <button
                type="button"
                onClick={() => removeImage(idx, url)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center transition-colors"
              >
                ×
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-brand-500 text-white px-1.5 py-0.5 rounded-full">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {imageList.length < 5 && (
        <label className={`flex flex-col items-center gap-2 border border-dashed rounded-xl p-5 cursor-pointer transition-colors ${
          uploading
            ? 'opacity-50 pointer-events-none border-white/10'
            : 'border-white/20 hover:border-brand-500/50 hover:bg-brand-500/5'
        }`}>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <div className="w-7 h-7 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Uploading...</p>
            </>
          ) : (
            <>
              <div className="text-3xl">📷</div>
              <p className="text-sm text-white font-medium">Click to upload photos</p>
              <p className="text-xs text-slate-500">
                JPG, PNG, WEBP · Max 5MB each · {5 - imageList.length} remaining
              </p>
            </>
          )}
        </label>
      )}

      {imageList.length >= 5 && (
        <p className="text-xs text-slate-500 text-center py-1">Maximum 5 photos reached</p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

// ✅ PGFormBody — uses ImageUploader instead of old base64 field
const PGFormBody = ({ data, setData, onSubmit, loading: busy, onCancel, submitLabel }) => (
  <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">

    <Field label="PG Name *">
      <input placeholder="e.g. Sunrise Residency" value={data.title}
        onChange={e => setData(p => ({ ...p, title: e.target.value }))} className={inp} />
    </Field>

    <div className="grid grid-cols-2 gap-3">
      <Field label="City *">
        <input placeholder="e.g. Bangalore" value={data.city}
          onChange={e => setData(p => ({ ...p, city: e.target.value }))} className={inp} />
      </Field>
      <Field label="Area">
        <input placeholder="e.g. Koramangala" value={data.area}
          onChange={e => setData(p => ({ ...p, area: e.target.value }))} className={inp} />
      </Field>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Field label="Starting price (₹/mo) *">
        <input type="number" placeholder="8000" value={data.price}
          onChange={e => setData(p => ({ ...p, price: e.target.value }))} className={inp} />
      </Field>
      <Field label="Contact number">
        <input placeholder="+91 98765 43210" value={data.phone}
          onChange={e => setData(p => ({ ...p, phone: e.target.value }))} className={inp} />
      </Field>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Field label="Gender preference">
        <select value={data.type} onChange={e => setData(p => ({ ...p, type: e.target.value }))} className={inp}>
          <option value="coed" className="bg-slate-900">Co-ed</option>
          <option value="male" className="bg-slate-900">Male only</option>
          <option value="female" className="bg-slate-900">Female only</option>
        </select>
      </Field>
      {data.available !== undefined && (
        <Field label="Availability">
          <select value={String(data.available)}
            onChange={e => setData(p => ({ ...p, available: e.target.value === 'true' }))} className={inp}>
            <option value="true" className="bg-slate-900">Available</option>
            <option value="false" className="bg-slate-900">Fully occupied</option>
          </select>
        </Field>
      )}
    </div>

    {/* ✅ Real image uploader — no more base64 */}
    <Field label="PG Photos (up to 5)">
      <ImageUploader images={data.images} setData={setData} />
    </Field>

    {/* Rooms */}
    <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-300">Room details</p>
        <button
          onClick={() => setData(p => ({ ...p, rooms: [...p.rooms, { type: 'Single', price: '', available: '' }] }))}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
          + Add room type
        </button>
      </div>
      {data.rooms.map((room, idx) => (
        <div key={idx} className="relative">
          <RoomRow
            room={room}
            onChange={(field, val) =>
              setData(p => ({
                ...p,
                rooms: p.rooms.map((r, i) => i === idx ? { ...r, [field]: val } : r),
              }))
            }
          />
          {data.rooms.length > 1 && (
            <button
              onClick={() => setData(p => ({ ...p, rooms: p.rooms.filter((_, i) => i !== idx) }))}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center justify-center hover:bg-red-500/40">
              ×
            </button>
          )}
        </div>
      ))}
    </div>

    <div className="flex gap-3 pt-2">
      <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
      <Button className="flex-1" loading={busy} onClick={onSubmit}
        disabled={!data.title || !data.city || !data.price}>
        {submitLabel}
      </Button>
    </div>
  </div>
);

// ✅ blankPG — images is now array
const blankPG = {
  title: '', city: '', area: '', price: '',
  phone: '', type: 'coed',
  images: [],       // ✅ array not string
  available: true,
  rooms: [{ type: 'Single', price: '', available: '' }],
};

export default function OwnerDashboard() {
  const { showToast } = useApp();

  const [listings, setListings]   = useState([]);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('listings');

  const [deleteId, setDeleteId]     = useState(null);
  const [addModal, setAddModal]     = useState(false);
  const [editModal, setEditModal]   = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [newPG, setNewPG]   = useState(blankPG);
  const [editPG, setEditPG] = useState(null);

  useEffect(() => {
    Promise.all([
      pgService.getMyListings().then(setListings),
      bookingService.getOwnerRequests().then(setRequests),
    ]).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await pgService.delete(id);
      setListings(l => l.filter(p => p._id !== id));
      showToast('Listing deleted', 'info');
    } catch {
      showToast('Delete failed', 'error');
    } finally { setDeleteId(null); }
  };

  const handleRequestAction = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      setRequests(r => r.map(req => req.id === id ? { ...req, status } : req));
      showToast(`Request ${status}`, status === 'approved' ? 'success' : 'info');
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleAddPG = async () => {
    setAddLoading(true);
    try {
      const created = await pgService.create({
        title:       newPG.title,
        city:        newPG.city,
        area:        newPG.area || newPG.city,
        price:       Number(newPG.price),
        type:        newPG.type,
        description: '',
        // ✅ images is already array of real URLs from multer
        images: newPG.images?.length > 0
          ? newPG.images
          : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
        amenities:  ['WiFi'],
        ownerPhone: newPG.phone || '',
        rooms: newPG.rooms.map(r => ({
          type:      r.type || 'Single',
          price:     Number(r.price) || Number(newPG.price),
          available: Number(r.available) || 1,
        })),
      });
      setListings(l => [created, ...l]);
      setAddModal(false);
      setNewPG(blankPG);
      showToast('PG listed successfully!', 'success');
    } catch (err) {
      console.error('Add PG failed:', err.response?.data?.message || err.message);
      showToast(err.response?.data?.message || 'Failed to add PG', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditClick = (pg) => {
    setEditPG({
      _id:       pg._id,
      title:     pg.title,
      city:      pg.location?.city || '',
      area:      pg.location?.area || '',
      price:     pg.price,
      phone:     pg.owner?.phone   || '',
      type:      pg.type,
      images:    Array.isArray(pg.images) ? pg.images : (pg.images ? [pg.images] : []), // ✅ always array
      available: pg.available,
      rooms: pg.rooms?.length > 0
        ? pg.rooms
        : [{ type: 'Single', price: pg.price, available: 1 }],
    });
    setEditModal(true);
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      const updated = await pgService.update(editPG._id, {
        title:     editPG.title,
        price:     Number(editPG.price),
        type:      editPG.type,
        available: editPG.available,
        location:  { city: editPG.city, area: editPG.area },
        // ✅ images is array of real URLs
        images: editPG.images?.length > 0
          ? editPG.images
          : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
        'owner.phone': editPG.phone,
        rooms: editPG.rooms.map(r => ({
          type:      r.type,
          price:     Number(r.price),
          available: Number(r.available),
        })),
      });
      setListings(l => l.map(p => p._id === editPG._id ? updated : p));
      setEditModal(false);
      showToast('PG updated!', 'success');
    } catch {
      showToast('Update failed', 'error');
    } finally { setEditLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Owner Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your PG listings and booking requests</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setNewPG(blankPG); setAddModal(true); }}>
          Add New PG
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'My Listings',      value: listings.length,                                     icon: '🏠' },
          { label: 'Booking Requests', value: requests.length,                                     icon: '📋' },
          { label: 'Pending',          value: requests.filter(r => r.status === 'pending').length, icon: '⏳' },
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
              activeTab === tab.id
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {activeTab === 'listings' && (
        loading
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          : listings.length === 0
            ? <EmptyState icon="🏠" title="No listings yet"
                description="Add your first PG to start accepting bookings."
                action={<Button onClick={() => setAddModal(true)} icon={<Plus size={16} />}>Add PG</Button>} />
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map(pg => {
                  const totalBeds  = (pg.rooms || []).reduce((s, r) => s + (Number(r.available) || 0), 0);
                  const safeRating = Number(pg.rating) || 0;
                  return (
                    <div key={pg._id} className="glass rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all">
                      <div className="relative h-40">
                        <img
                          src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'}
                          alt={pg.title} className="w-full h-full object-cover"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'; }}
                        />
                        <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${pg.available ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          {totalBeds} bed{totalBeds !== 1 ? 's' : ''} free
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-white">{pg.title}</p>
                        <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin size={12} />{pg.location?.area}, {pg.location?.city}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-brand-400 font-bold">₹{Number(pg.price).toLocaleString()}/mo</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} size={11}
                                style={{ fill: i <= Math.round(safeRating) ? '#fbbf24' : 'transparent', color: i <= Math.round(safeRating) ? '#fbbf24' : '#475569' }} />
                            ))}
                            {safeRating > 0 && <span className="text-amber-400 text-xs ml-1">{safeRating.toFixed(1)}</span>}
                          </div>
                        </div>
                        {pg.rooms?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {pg.rooms.map((r, i) => (
                              <span key={i} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">
                                {r.type}: {r.available} bed{r.available !== 1 ? 's' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button variant="secondary" size="sm" className="flex-1" icon={<Edit size={13} />}
                            onClick={() => handleEditClick(pg)}>Edit</Button>
                          <Button variant="danger" size="sm" icon={<Trash2 size={13} />}
                            onClick={() => setDeleteId(pg._id)}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
      )}

      {/* Requests tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0
            ? <EmptyState icon="📬" title="No booking requests"
                description="When tenants request to book your PG, they'll appear here." />
            : requests.map(req => (
                <div key={req.id} className="glass rounded-2xl border border-white/5 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400">
                        {req.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-white">{req.tenant}</p>
                        <p className="text-xs text-slate-400">{req.email}</p>
                      </div>
                    </div>
                    <div className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize ${
                      req.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                      req.status === 'pending'  ? 'bg-amber-400/10  text-amber-400  border-amber-400/20'  :
                                                  'bg-red-400/10    text-red-400    border-red-400/20'
                    }`}>{req.status}</div>
                  </div>
                  <div className="mt-4 text-sm text-slate-400 space-y-1">
                    <p>PG: <span className="text-white">{req.pgTitle}</span></p>
                    <p>Room: <span className="text-white">{req.roomType}</span></p>
                    <p>Check-in: <span className="text-white">{req.checkIn}</span></p>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-3 mt-4">
                      <Button variant="success" size="sm" icon={<Check size={14} />}
                        onClick={() => handleRequestAction(req.id, 'approved')}>Accept</Button>
                      <Button variant="danger" size="sm" icon={<X size={14} />}
                        onClick={() => handleRequestAction(req.id, 'rejected')}>Reject</Button>
                    </div>
                  )}
                </div>
              ))
          }
        </div>
      )}

      {/* Delete modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Listing" size="sm">
        <p className="text-slate-400 text-sm mb-5">Are you sure? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>

      {/* Add modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New PG Listing">
        <PGFormBody
          data={newPG} setData={setNewPG}
          onSubmit={handleAddPG} loading={addLoading}
          onCancel={() => setAddModal(false)}
          submitLabel="Add Listing"
        />
      </Modal>

      {/* Edit modal */}
      {editPG && (
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit PG Listing">
          <PGFormBody
            data={editPG} setData={setEditPG}
            onSubmit={handleEditSave} loading={editLoading}
            onCancel={() => setEditModal(false)}
            submitLabel="Save Changes"
          />
        </Modal>
      )}
    </div>
  );
}