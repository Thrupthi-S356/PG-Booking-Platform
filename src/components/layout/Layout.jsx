import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Home, Map, MessageCircle, User, LogOut, Menu, X, Building2, LayoutDashboard } from 'lucide-react';

export default function Layout() {
  const { isAuthenticated, user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'Listings', icon: Home },
    { to: '/map', label: 'Map View', icon: Map },
    { to: '/contact', label: 'Contact', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-dark shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center group-hover:bg-brand-400 transition-colors">
                <Building2 size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                PG<span className="text-gradient">Finder</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === to
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to={`/chat`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === '/chat'
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Messages
                </Link>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant'}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass text-sm">
                    <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-slate-200">{user?.name?.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium rounded-lg transition-colors">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden glass-dark border-t border-white/5 px-4 py-4 space-y-2 animate-slide-up">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === to ? 'bg-brand-500/20 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/chat" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5">
                  <MessageCircle size={16} />Messages
                </Link>
                <Link
                  to={user?.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant'}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <LayoutDashboard size={16} />Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-400/10 w-full">
                  <LogOut size={16} />Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 py-2 text-center text-sm text-slate-300 border border-white/10 rounded-lg hover:border-brand-500/50">Sign In</Link>
                <Link to="/register" className="flex-1 py-2 text-center text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-400">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                  <Building2 size={18} className="text-white" />
                </div>
                <span className="font-display font-bold text-xl">PG<span className="text-gradient">Finder</span></span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Discover the perfect paying guest accommodation across India. Verified listings, transparent pricing, and hassle-free booking.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-brand-400 transition-colors">Browse PGs</Link></li>
                <li><Link to="/map" className="hover:text-brand-400 transition-colors">Map View</Link></li>
                <li><Link to="/contact" className="hover:text-brand-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">For Owners</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/register" className="hover:text-brand-400 transition-colors">List Your PG</Link></li>
                <li><Link to="/dashboard/owner" className="hover:text-brand-400 transition-colors">Owner Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">© 2024 PGFinder. All rights reserved.</p>
            <p className="text-slate-500 text-xs">Made with ❤️ for comfortable living</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
