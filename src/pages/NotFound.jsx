import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-display font-black text-gradient mb-4">404</p>
      <h1 className="text-3xl font-display font-bold text-white mb-3">Page Not Found</h1>
      <p className="text-slate-400 max-w-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/"><Button size="lg">Back to Home</Button></Link>
    </div>
  );
}
