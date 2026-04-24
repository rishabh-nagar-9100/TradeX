import { useState } from 'react';
import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../../context/themeStore';
import SearchAutocomplete from '../search/SearchAutocomplete';

export default function Topbar({ onSearch, onToggleMobileNav }) {
  const { theme, toggleTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          onClick={onToggleMobileNav}
          aria-label="Open navigation"
          className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex flex-1 max-w-md">
          <SearchAutocomplete onSelect={onSearch} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setNotificationsOpen(open => !open);
              setProfileOpen(false);
            }}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-trade-red rounded-full"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-dark-border dark:bg-dark-card">
              <h3 className="mb-2 text-sm font-bold">Notifications</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">Mock price stream is active when no API key is configured.</p>
                <p className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">Use Settings to connect Finnhub or Alpha Vantage.</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(open => !open);
              setNotificationsOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-medium text-sm ml-2"
            aria-label="Open profile menu"
          >
            RN
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-dark-border dark:bg-dark-card">
              <span className="block text-sm font-bold">TradeX User</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Local dashboard session</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
