import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

interface AuthFormsProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
  initialView?: 'login' | 'register';
}

export const AuthForms: React.FC<AuthFormsProps> = ({ onLogin, onCancel, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (view === 'register' && !formData.name) {
      setError('Name is required');
      return;
    }

    // Mock authentication
    setTimeout(() => {
      onLogin({
        name: view === 'register' ? formData.name : 'Demo User',
        email: formData.email
      });
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 mt-2">
            {view === 'login' 
              ? 'Enter your credentials to access your history' 
              : 'Join to save your vehicle inspection reports'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
          >
            {view === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500">
            {view === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => {
              setView(view === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {view === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
      <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 text-sm">
          Cancel and return to home
        </button>
      </div>
    </div>
  );
};