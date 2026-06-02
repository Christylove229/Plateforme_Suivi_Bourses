import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Landmark, 
  LayoutDashboard, 
  GraduationCap, 
  Send, 
  User, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    currentUser, 
    logout, 
    getCloseDeadlinesCount, 
    unreceivedRecommendationsCount, 
    theme,
    toggleTheme 
  } = useApp();
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeCount = getCloseDeadlinesCount();
  const recCount = unreceivedRecommendationsCount();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Accueil',
      icon: LayoutDashboard,
      badge: null,
      show: true
    },
    {
      id: 'bourses',
      label: 'Mes Bourses',
      icon: GraduationCap,
      badge: closeCount > 0 ? { text: `${closeCount}`, type: 'warning' } : null,
      show: currentUser?.role === 'USER'
    },
    {
      id: 'recommandations',
      label: 'Recommandations',
      icon: Send,
      badge: recCount > 0 ? { text: `${recCount}`, type: 'info' } : null,
      show: currentUser?.role === 'USER'
    },
    {
      id: 'profil',
      label: 'Mon Profil',
      icon: User,
      badge: null,
      show: true
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: ShieldCheck,
      badge: null,
      show: currentUser?.role === 'ADMIN'
    }
  ];

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="md:hidden w-full h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-40 fixed top-0 left-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500">
            <Landmark className="h-5 w-5" />
          </div>
          <span className="font-sans font-bold text-white text-sm tracking-tight text-amber-500">ScholarTrack</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Main Drawer Overlay for mobile */}
      <div 
        className={`md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside 
        className={`w-64 bg-slate-950 border-r border-slate-850 flex flex-col justify-between fixed h-full z-45 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 pt-16' : '-translate-x-full'
        } md:pt-0 pt-16`}
      >
        <div>
          {/* Logo & Platform Metadata */}
          <div className="hidden md:flex items-center gap-3 p-6 border-b border-slate-900">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl text-amber-500">
              <Landmark className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="font-sans font-bold tracking-tight text-white leading-tight">ScholarTrack</p>
              <p className="text-[9px] uppercase font-mono tracking-widest text-amber-500 font-semibold">PREMIUM HUB</p>
            </div>
          </div>

          {/* Current User Preview Badge */}
          {currentUser && (
            <div className="m-4 p-3.5 bg-gradient-to-br from-slate-900 to-slate-950/40 rounded-xl border border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="h-8.5 w-8.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-sans font-bold text-amber-500 text-xs text-center shrink-0">
                  {currentUser.prenom[0]}{currentUser.nom[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-xs font-semibold truncate leading-tight">
                    {currentUser.prenom} {currentUser.nom}
                  </p>
                  <p className="text-[10px] text-amber-500/80 font-mono font-medium truncate mt-1">
                    {currentUser.role === 'ADMIN' ? '🎓 Direction' : currentUser.domaine_etudes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1">
            {navItems.filter(item => item.show).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-150 ${
                    isActive 
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                      : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-lg ${
                      item.badge.type === 'warning' 
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' 
                        : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400'
                    }`}>
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className="p-4 border-t border-slate-900 space-y-3.5 bg-slate-950/80">
          
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.2 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl text-slate-350 hover:text-white text-xs font-semibold cursor-pointer transition-all duration-155"
            title="Bascule intelligente du thème visuel (Clair / Sombre)"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
                  <span>Passer au Thème Clair</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-400 animate-pulse" />
                  <span>Passer au Thème Sombre</span>
                </>
              )}
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-400 px-1.5 py-0.5 bg-slate-950/45 rounded border border-slate-850">
              {theme === 'dark' ? 'SOM' : 'CLA'}
            </span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 rounded-xl text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <LogOut className="h-4 w-4 text-rose-500" />
            <span>Se déconnecter</span>
          </button>
          
          <div className="text-center">
            <p className="text-[10px] font-mono text-slate-600">ScholarTrack v1.0 • 2026</p>
          </div>
        </div>
      </aside>
    </>
  );
};
