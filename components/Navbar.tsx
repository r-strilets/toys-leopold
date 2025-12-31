
import React from 'react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  currentView: 'shop' | 'admin';
  onSwitchView: (view: 'shop' | 'admin') => void;
  isAdminAuthenticated: boolean;
  onOpenInfo: (type: 'contacts' | 'delivery') => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onOpenCart, 
  searchQuery, 
  setSearchQuery, 
  currentView, 
  onSwitchView,
  isAdminAuthenticated,
  onOpenInfo
}) => {
  return (
    <nav className="fixed top-0 left-0 w-full z-40">
      {/* Верхня службова панель (Top Bar) */}
      <div className="bg-gray-900 text-white/80 py-2 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-[11px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider">
          <div className="flex gap-4 sm:gap-6 lg:gap-8">
            <button 
              onClick={() => onOpenInfo('delivery')}
              className="flex items-center gap-1.5 hover:text-orange-400 transition-colors"
            >
              <span className="text-sm lg:text-base">🚚</span> Доставка
            </button>
            <button 
              onClick={() => onOpenInfo('contacts')}
              className="flex items-center gap-1.5 hover:text-orange-400 transition-colors"
            >
              <span className="text-sm lg:text-base">📍</span> Контакти
            </button>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <span className="hidden sm:inline-block opacity-40">Ми поруч:</span>
            <div className="flex gap-4 lg:gap-5">
              <a 
                href="https://www.instagram.com/toys_leopold_khm/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:scale-125 hover:text-orange-400 transition-all flex items-center"
                title="Ми в Instagram"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.tiktok.com/@leopold.toys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:scale-125 hover:text-white transition-all flex items-center"
                title="Ми в TikTok"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-4.17.07-8.33.07-12.5z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Основна панель навігації */}
      <div className="bg-white/80 backdrop-blur-md border-b border-yellow-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between py-3 md:h-20 md:py-0">
          <div className="flex items-center justify-between w-full md:w-auto mb-3 md:mb-0">
            <div 
              className="flex items-center gap-2 group cursor-pointer" 
              onClick={() => {
                onSwitchView('shop');
                window.scrollTo({top: 0, behavior: 'smooth'});
              }}
            >
              <div className="bg-yellow-400 w-10 h-10 rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <span className="text-xl lg:text-2xl">🐱</span>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-gray-800 tracking-tight uppercase">Леопольд</span>
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => onSwitchView(currentView === 'shop' ? 'admin' : 'shop')}
                className={`w-10 h-10 rounded-xl text-base font-black transition-all border-2 flex items-center justify-center shadow-sm ${
                  currentView === 'admin' 
                    ? 'bg-orange-500 border-orange-500 text-white' 
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                {currentView === 'admin' ? '🏠' : (isAdminAuthenticated ? '🔓' : '🔒')}
              </button>

              {currentView === 'shop' && (
                <button 
                  onClick={onOpenCart}
                  className="relative p-1 text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-md">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Пошук - Десктоп */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            {currentView === 'shop' && (
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Знайти іграшку..."
                  className="w-full bg-gray-100 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl px-12 py-3 outline-none transition-all text-black font-bold placeholder-gray-500 lg:text-lg"
                />
                <svg className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Пошук - Мобільний */}
          <div className="md:hidden w-full mb-1">
            {currentView === 'shop' && (
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Знайти іграшку..."
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-yellow-400 focus:bg-white rounded-xl px-10 py-2.5 outline-none transition-all text-black font-bold placeholder-gray-400 text-sm"
                />
                <svg className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => onSwitchView(currentView === 'shop' ? 'admin' : 'shop')}
              className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl text-lg lg:text-xl font-black transition-all border-2 flex items-center justify-center shadow-sm ${
                currentView === 'admin' 
                  ? 'bg-orange-500 border-orange-500 text-white' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
              }`}
              title={currentView === 'admin' ? 'До магазину' : (isAdminAuthenticated ? 'В адмінку' : 'Увійти')}
            >
              {currentView === 'admin' ? (
                <span className="text-xl lg:text-2xl">🏠</span>
              ) : (
                isAdminAuthenticated ? '🔓' : '🔒'
              )}
            </button>

            {currentView === 'shop' && (
              <button 
                onClick={onOpenCart}
                className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 lg:h-10 lg:w-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0 bg-orange-600 text-white text-[10px] lg:text-xs font-bold h-5 w-5 lg:h-6 lg:w-6 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
