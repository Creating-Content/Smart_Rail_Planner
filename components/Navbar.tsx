import React from 'react';
import { TrainIcon, UserCircleIcon, LogoutIcon, TicketIcon } from './icons';

interface NavbarProps {
  user: { name: string } | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  onNavigate: (page: 'search' | 'platform' | 'season') => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick, onProfileClick, onLogout, onNavigate }) => {
  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
            onClick={() => onNavigate('search')}
          >
            <TrainIcon className="w-7 h-7" />
            <span className="hidden sm:inline">SmartRail Planner</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('platform')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden md:flex items-center gap-1.5">
              <TicketIcon className="w-5 h-5"/> Platform Ticket
            </button>
            <button onClick={() => onNavigate('season')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden md:flex items-center gap-1.5">
              <TicketIcon className="w-5 h-5"/> Season Ticket
            </button>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={onProfileClick} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-sm font-medium py-2 px-3 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                <button onClick={onLogout} title="Logout" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <LogoutIcon className="w-5 h-5"/>
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Sign Up / Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
