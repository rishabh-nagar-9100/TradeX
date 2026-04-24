import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({
  children,
  activeView,
  onViewChange,
  onSearch,
  mobileNavOpen,
  onToggleMobileNav,
  onCloseMobileNav
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        isOpen={mobileNavOpen}
        onClose={onCloseMobileNav}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onSearch={onSearch} onToggleMobileNav={onToggleMobileNav} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
