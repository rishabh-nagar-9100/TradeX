import { LayoutDashboard, TrendingUp, PieChart, Star, Settings } from 'lucide-react';

export default function Sidebar({ activeView, onViewChange, isOpen, onClose }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
  ];

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-dark-border">
        <div className="flex items-center gap-2 text-brand-500">
          <TrendingUp className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">TradeX</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => {
              onViewChange(link.id);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeView === link.id
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-dark-border">
        <button
          onClick={() => {
            onViewChange('settings');
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'settings'
              ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
      </aside>
    </>
  );
}
