import React, { useState, useEffect } from 'react';
import { Search, MapPin, TrendingUp } from 'lucide-react';
import { pgService } from '../services/api';
import PGCard from '../components/common/PGCard';
import FilterPanel from '../components/common/FilterPanel';
import { SkeletonCard } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
const cities = ['Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi', 'Chennai'];

const defaultFilters = { city: '', type: '', minPrice: '', maxPrice: '', amenities: [], search: '' };

export default function Home() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => fetchPGs(), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchPGs = async () => {
    setLoading(true);
    try {
      const data = await pgService.getAll(filters);
      setPgs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setFilters(defaultFilters);

  const activeFilterCount = [filters.city, filters.type, filters.minPrice, filters.maxPrice]
    .filter(Boolean).length + (filters.amenities?.length || 0);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[520px] flex items-center justify-center overflow-hidden bg-hero-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950" />
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-700/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-12">
          <div className="inline-flex items-center gap-2 text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-6">
            <TrendingUp size={12} />
            1,200+ verified PGs across India
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect<br />
            <span className="text-gradient">Home Away</span> From Home
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Browse verified paying guest accommodations with transparent pricing and zero brokerage.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 glass rounded-2xl p-3 max-w-2xl mx-auto border border-white/10">
            <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by location or PG name..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 sm:w-44">
              <MapPin size={16} className="text-slate-400 shrink-0" />
              <select
                value={filters.city}
                onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
                className="flex-1 bg-transparent text-sm text-white focus:outline-none appearance-none"
              >
                <option value="" className="bg-slate-900">All Cities</option>
                {cities.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
            <Button size="md" className="shrink-0">
              Search PGs
            </Button>
          </div>

          {/* Quick city pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {cities.map(c => (
              <button
                key={c}
                onClick={() => setFilters(f => ({ ...f, city: f.city === c ? '' : c }))}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  filters.city === c
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-white">
              {loading ? 'Loading...' : `${pgs.length} PG${pgs.length !== 1 ? 's' : ''} Found`}
            </h2>
            {filters.city && <p className="text-sm text-slate-400 mt-1">in {filters.city}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/map">
              <Button variant="secondary" size="sm" icon={<MapPin size={14} />}>Map View</Button>
            </Link>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                showFilters || activeFilterCount > 0
                  ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          {showFilters && (
            <div className="w-72 shrink-0 hidden lg:block">
              <div className="sticky top-20">
                <FilterPanel filters={filters} onChange={setFilters} onReset={handleReset} />
              </div>
            </div>
          )}

          {/* Mobile Filter Panel */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-40 flex">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilters(false)} />
              <div className="relative ml-auto w-80 bg-slate-900 h-full overflow-y-auto p-4">
                <FilterPanel filters={filters} onChange={setFilters} onReset={handleReset} />
              </div>
            </div>
          )}

          {/* Listings Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : pgs.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No PGs found"
                description="Try adjusting your filters or search term to find available accommodations."
                action={<Button onClick={handleReset} variant="outline">Clear Filters</Button>}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {pgs.map((pg, i) => (
                  <div key={pg._id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <PGCard pg={pg} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
