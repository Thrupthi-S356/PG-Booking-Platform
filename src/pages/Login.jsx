import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'owner' ? '/dashboard/owner' : '/');
    } catch (err) {
      setErrors({ general: 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (role) => {
    setLoading(true);
    try {
      const email = role === 'owner' ? 'owner@demo.com' : 'tenant@demo.com';
      const user = await login(email, 'password');
      // Override role for demo
      const stored = JSON.parse(localStorage.getItem('pg_user') || '{}');
      localStorage.setItem('pg_user', JSON.stringify({ ...stored, role }));
      navigate(role === 'owner' ? '/dashboard/owner' : '/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-16">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">PG<span className="text-gradient">Finder</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to continue to your account</p>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-8">
          {errors.general && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              error={errors.email}
              icon={<Mail size={16} />}
            />
            <div>
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                error={errors.password}
                icon={<Lock size={16} />}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                style={{ position: 'relative', float: 'right', marginTop: '-2.2rem', marginRight: '0.75rem' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="accent-brand-500" /> Remember me
              </label>
              <a href="#" className="text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-500 bg-transparent">
              <span className="px-3 bg-slate-900/80">or try a demo account</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => loginAsDemo('tenant')} disabled={loading}>
              Demo Tenant
            </Button>
            <Button variant="secondary" onClick={() => loginAsDemo('owner')} disabled={loading}>
              Demo Owner
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
