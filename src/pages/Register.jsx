import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building2, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'tenant' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email,password: form.password,role: form.role });
      navigate(form.role === 'owner' ? '/dashboard/owner' : '/');
    } catch (err) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-16">
      <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">PG<span className="text-gradient">Finder</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm">Join thousands of happy residents</p>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-8">
          {errors.general && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Role Selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-300 mb-3">I am a…</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'tenant', label: 'Tenant', sub: 'Looking for PG', icon: Home },
                { value: 'owner', label: 'Owner', sub: 'List my PG', icon: Building2 },
              ].map(({ value, label, sub, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: value }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    form.role === value
                      ? 'bg-brand-500/15 border-brand-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${form.role === value ? 'bg-brand-500' : 'bg-white/10'}`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${form.role === value ? 'text-brand-400' : 'text-white'}`}>{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" type="text" placeholder="John Doe" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} icon={<User size={16} />} />
            <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} icon={<Mail size={16} />} />
            <Input label="Password" type="password" placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} error={errors.password} icon={<Lock size={16} />} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} error={errors.confirmPassword} icon={<Lock size={16} />} />

            <p className="text-xs text-slate-500">
              By creating an account, you agree to our <a href="#" className="text-brand-400 hover:underline">Terms</a> and{' '}
              <a href="#" className="text-brand-400 hover:underline">Privacy Policy</a>.
            </p>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
