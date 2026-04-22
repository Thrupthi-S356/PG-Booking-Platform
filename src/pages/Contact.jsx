import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { contactService } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useApp } from '../context/AppContext';

export default function Contact() {
  const { showToast } = useApp();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await contactService.send(form);
      showToast('Message sent! We\'ll get back to you soon.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch {
      showToast('Failed to send message. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-display font-bold text-white mb-4">Get In Touch</h1>
        <p className="text-slate-400 max-w-xl mx-auto">Have questions or need help? Our team is here to assist you find the perfect PG accommodation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-4">
          {[
            { icon: Mail, title: 'Email Us', sub: 'support@pgfinder.com', color: 'text-brand-400 bg-brand-400/10' },
            { icon: Phone, title: 'Call Us', sub: '+91 1800-PG-FIND', color: 'text-emerald-400 bg-emerald-400/10' },
            { icon: MapPin, title: 'Office', sub: '42, MG Road, Bangalore - 560001', color: 'text-blue-400 bg-blue-400/10' },
            { icon: Clock, title: 'Working Hours', sub: 'Mon–Sat, 9 AM – 7 PM', color: 'text-amber-400 bg-amber-400/10' },
          ].map(({ icon: Icon, title, sub, color }) => (
            <div key={title} className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4 hover:border-white/10 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-slate-400 text-sm mt-0.5">{sub}</p>
              </div>
            </div>
          ))}

          {/* FAQ Snippet */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <MessageCircle size={16} className="text-brand-400" />
              Quick Answers
            </h3>
            {[
              { q: 'Is PGFinder free to use?', a: 'Yes, browsing and contacting owners is always free.' },
              { q: 'How do I list my PG?', a: 'Register as an owner and use the Owner Dashboard.' },
            ].map(({ q, a }) => (
              <div key={q} className="mb-3 last:mb-0">
                <p className="text-sm text-slate-300 font-medium">{q}</p>
                <p className="text-xs text-slate-500 mt-0.5">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3 glass rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" type="text" placeholder="John Doe" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
              <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} />
            </div>
            <Input label="Subject (optional)" type="text" placeholder="How can we help?" value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Message</label>
              <textarea
                rows={5}
                placeholder="Tell us what you need…"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm resize-none transition-all ${
                  errors.message ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:border-brand-500/50 focus:ring-brand-500/20'
                }`}
              />
              {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading} icon={<Send size={16} />}>
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
