import { useState } from 'react';
import { Menu, X, ArrowUpRight, PenTool, Radio } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAdmin: () => void;
  isAdminMode: boolean;
}

export default function Header({ currentView, onNavigate, onOpenAdmin, isAdminMode }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Product', view: 'product_dummy' },
    { label: 'Blog', view: 'home' },
    { label: 'Resources', view: 'resources_dummy' },
    { label: 'About', view: 'about_dummy' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-brand-gold border-b border-brand-gold-dark/20 shadow-md overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}>
            <div className="flex items-center space-x-2 bg-brand-gold border-2 border-brand-green rounded-xl px-3.5 py-1.5 shadow-sm transition-transform hover:scale-102">
              {/* Silhouette of Africa SVG */}
              <svg className="w-5 h-5 text-brand-green fill-current" viewBox="0 0 100 100">
                <path d="M 45,15 C 55,16 65,22 75,25 C 80,27 82,32 80,38 C 78,44 75,50 72,56 C 68,64 64,72 60,80 C 58,84 56,88 54,92 C 53,94 51,94 50,90 C 48,84 46,78 43,72 C 40,66 38,62 35,58 C 31,54 27,51 24,47 C 21,43 20,38 23,34 C 26,30 30,28 34,25 C 38,22 41,18 45,15 Z" />
              </svg>
              <span className="font-display font-black text-lg tracking-tight text-brand-green">
                Payfrica
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center h-full">
            {navItems.map((item) => {
              const isActive = (item.view === 'home' && (currentView === 'home' || currentView.startsWith('post_') || currentView.startsWith('category_') || currentView.startsWith('author_'))) || currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.view)}
                  className={`relative py-2 text-sm transition-colors hover:text-brand-green cursor-pointer ${
                    isActive ? 'text-brand-green font-bold border-b-2 border-brand-green' : 'text-brand-navy/80 hover:text-brand-green font-semibold'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Call to Action */}
          <div className="hidden md:flex items-center h-full space-x-4">
            <button
              onClick={onOpenAdmin}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border cursor-pointer transition-all ${
                isAdminMode 
                  ? 'bg-brand-navy text-white border-brand-navy shadow-lg' 
                  : 'bg-white/40 text-brand-navy border-brand-navy/10 hover:border-brand-navy/30 hover:bg-white/60'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isAdminMode ? 'Creator Studio Active' : 'Creator Studio'}</span>
            </button>

            <div className="flex items-center h-full bg-brand-green pl-16 pr-8 -mr-8 [clip-path:polygon(32px_0,100%_0,100%_100%,0_100%)]">
              <a
                href="https://bridge.payfrical.xyz"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold text-xs tracking-wide py-2.5 px-6 rounded-full transition-all cursor-pointer hover:scale-105"
              >
                <span>Open Dapp</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={onOpenAdmin}
              className={`p-2 rounded-lg border ${
                isAdminMode ? 'bg-brand-navy text-brand-green border-brand-navy' : 'bg-brand-gold-light/40 text-brand-navy/70 border-brand-navy/10'
              }`}
              title="Creator Studio"
            >
              <PenTool className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-brand-navy/80 hover:text-brand-green focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-brand-gold-light border-t border-brand-gold-dark/10 py-4 px-4 space-y-3 shadow-inner">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = (item.view === 'home' && (currentView === 'home' || currentView.startsWith('post_') || currentView.startsWith('category_'))) || currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate(item.view);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    isActive ? 'bg-brand-green text-white font-bold' : 'text-brand-navy/80 hover:bg-brand-gold/20 hover:text-brand-navy'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          
          <div className="pt-4 border-t border-brand-gold-dark/10 flex flex-col space-y-2">
            <button
              onClick={() => {
                onOpenAdmin();
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-xl text-sm font-semibold border ${
                isAdminMode 
                  ? 'bg-brand-navy text-white border-brand-navy' 
                  : 'bg-white text-brand-navy border-brand-navy/10'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>{isAdminMode ? 'Exit Creator Studio' : 'Open Creator Studio'}</span>
            </button>
            
            <a
              href="https://bridge.payfrical.xyz"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center space-x-1.5 w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md"
            >
              <span>Open Dapp</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
