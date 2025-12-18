import React from 'react';
import { Car, User as UserIcon, LogOut } from 'lucide-react';
import { User, ViewType } from '../types';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: ViewType) => void;
  onSignOut: () => void;
  onOpenHowItWorks: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onSignOut, onOpenHowItWorks }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate('home')}
        >
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Car size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
            AutoSpector AI
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <button 
            onClick={onOpenHowItWorks}
            className="hidden md:inline hover:text-blue-600 cursor-pointer transition"
          >
            How it Works
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className="hidden md:inline hover:text-blue-600 cursor-pointer transition"
          >
            History
          </button>
          
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="hidden md:flex items-center gap-2 text-slate-800">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon size={16} />
                </div>
                <span>{user.name}</span>
              </div>
              <button 
                onClick={onSignOut}
                className="text-slate-500 hover:text-red-600 transition p-2"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};