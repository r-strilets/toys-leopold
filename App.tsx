
import React, { useState, useMemo, useEffect } from 'react';
import { TOYS as INITIAL_TOYS, CATEGORIES as INITIAL_CATEGORIES, DEFAULT_TOY_IMAGE } from './constants';
import { Toy, CartItem, Category, Order, ShopSettings } from './types';
import Navbar from './components/Navbar';
import ToyCard from './components/ToyCard';
import CartDrawer from './components/CartDrawer';
import AIHelper from './components/AIHelper';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import InfoModal from './components/InfoModal';
import ToyDetailModal from './components/ToyDetailModal';

const ITEMS_PER_PAGE = 12;
const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4TzjApZN_N7cAGmI7W-6t_J1OLlt_PCD9nAOxK0yKcUMmrfGSXfAPi14_E0G2sxgfxjdfblPr3LV-/pub?output=csv";

const DEFAULT_TG_TOKEN = '6298250645:AAG4BcKgTE-sw3fbTPGuZJaZ-z4qmP66XfY';
const DEFAULT_TG_CHAT_ID = '380200977';

const App: React.FC = () => {
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [allToys, setAllToys] = useState<Toy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toyOfTheDayId, setToyOfTheDayId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeInfoModal, setActiveInfoModal] = useState<'contacts' | 'delivery' | null>(null);
  const [selectedToyForDetail, setSelectedToyForDetail] = useState<Toy | null>(null);
  
  const [settings, setSettings] = useState<ShopSettings>({
    telegramToken: DEFAULT_TG_TOKEN,
    telegramChatId: DEFAULT_TG_CHAT_ID
  });

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') { field += '"'; i++; } 
        else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        row.push(field.trim()); field = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (field || row.length > 0) { row.push(field.trim()); rows.push(row); field = ''; row = []; }
        if (char === '\r' && nextChar === '\n') i++;
      } else { field += char; }
    }
    if (field || row.length > 0) { row.push(field.trim()); rows.push(row); }
    return rows;
  };

  const cleanPrice = (val: string) => {
    if (!val) return 0;
    const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const syncWithGoogleSheet = async (url?: string) => {
    try {
      const targetUrl = url || DEFAULT_SHEET_URL;
      const response = await fetch(targetUrl);
      if (!response.ok) {
        console.warn('Google Sheet fetch failed, using local/cached data');
        return false;
      }
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      if (rows.length < 2) return false;

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const dataRows = rows.slice(1);
      const findIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

      const nameIdx = findIdx(['назва', 'name', 'товар', 'найменування']);
      const priceIdx = findIdx(['ціна', 'price', 'вартість', 'оптова ціна', 'опт']);
      const discountIdx = findIdx(['знижка', 'discount', 'акція']);
      const categoryIdx = findIdx(['категорія', 'category']);
      const ageIdx = findIdx(['вік', 'age']);
      const imageIdx = findIdx(['фото', 'зображення', 'image', 'url']);
      const descIdx = findIdx(['опис', 'description']);

      if (nameIdx === -1 || priceIdx === -1) return false;

      const newImportedToys: Toy[] = [];
      const addedCategories: Category[] = [];

      dataRows.forEach((row, index) => {
        const name = row[nameIdx] || 'Без назви';
        const categoryName = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'all';
        const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        if (categoryId !== 'all' && !addedCategories.find(c => c.id === categoryId)) {
          addedCategories.push({ id: categoryId, name: categoryName });
        }

        const price = cleanPrice(row[priceIdx]);
        const discPriceRaw = discountIdx !== -1 ? row[discountIdx] : '';
        const discountPrice = discPriceRaw ? cleanPrice(discPriceRaw) : undefined;
        const rawImages = (imageIdx !== -1 && row[imageIdx]) ? row[imageIdx] : '';
        const images = rawImages ? rawImages.split(';').map(s => s.trim()) : [DEFAULT_TOY_IMAGE];
        const description = (descIdx !== -1 && row[descIdx] && row[descIdx].trim() !== '') ? row[descIdx] : name;

        newImportedToys.push({
          id: `sheet-${Date.now()}-${index}`,
          name,
          price,
          discountPrice: (discountPrice && discountPrice < price) ? discountPrice : undefined,
          category: categoryId,
          ageRange: ageIdx !== -1 ? row[ageIdx] : '3+',
          images: images,
          description: description
        });
      });

      if (newImportedToys.length > 0) {
        setAllToys(prev => {
          const existingNames = new Set(prev.map(t => t.name.toLowerCase().trim()));
          const uniqueNew = newImportedToys.filter(t => !existingNames.has(t.name.toLowerCase().trim()));
          const updated = [...prev, ...uniqueNew];
          localStorage.setItem('leopold_toys', JSON.stringify(updated));
          return updated;
        });
      }

      if (addedCategories.length > 0) {
        setCategories(prev => {
          const merged = [...prev];
          addedCategories.forEach(c => {
            if (!merged.find(m => m.id === c.id)) merged.push(c);
          });
          localStorage.setItem('leopold_categories', JSON.stringify(merged));
          return merged;
        });
      }
      return true;
    } catch (error) {
      console.error("Sync failed", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Data Loading from LocalStorage/Constants
    const savedToys = localStorage.getItem('leopold_toys');
    if (savedToys) setAllToys(JSON.parse(savedToys));
    else setAllToys(INITIAL_TOYS);

    const savedCategories = localStorage.getItem('leopold_categories');
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    else setCategories(INITIAL_CATEGORIES);

    const savedOrders = localStorage.getItem('leopold_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedSettings = localStorage.getItem('leopold_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedAuth = sessionStorage.getItem('leopold_admin_auth');
    if (savedAuth === 'true') setIsAdminAuthenticated(true);

    const savedToyId = localStorage.getItem('leopold_toy_of_the_day_id');
    if (savedToyId) setToyOfTheDayId(savedToyId);

    // 2. Async Sync with External Data
    syncWithGoogleSheet().catch(() => setIsLoading(false));
  }, []);

  const handleSaveSettings = (newSettings: ShopSettings) => {
    setSettings(newSettings);
    localStorage.setItem('leopold_settings', JSON.stringify(newSettings));
  };

  const handleTestTelegram = async (testSettings: ShopSettings) => {
    const token = testSettings.telegramToken?.trim();
    const chatId = testSettings.telegramChatId?.trim();
    if (!token || !chatId) return false;
    try {
      const msg = `🔔 ТЕСТ ЗВ'ЯЗКУ\nМагазин "Леопольд" працює! Давайте жити дружньо! 🐱`;
      const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(msg)}`;
      const res = await fetch(url);
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  const syncOrdersFromTelegram = async () => {
    const token = settings.telegramToken?.trim();
    if (!token) return { success: false, message: 'Bot Token не встановлено' };

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100&allowed_updates=["message","channel_post"]`);
      const data = await response.json();
      if (!data.ok) return { success: false, message: 'Помилка API: ' + (data.description || 'Невідома') };

      const updates = data.result || [];
      const newOrders: Order[] = [];
      const existingIds = new Set(orders.map(o => o.id));

      updates.forEach((update: any) => {
        const msg = update.message || update.channel_post;
        if (!msg || !msg.text) return;

        const text = msg.text;
        const nameMatch = text.match(/Клієнт:\s*(.*)/i);
        const phoneMatch = text.match(/Телефон:\s*(.*)/i);
        const totalMatch = text.match(/ЗАГАЛЬНА СУМА:\s*(\d+)/i);

        if (nameMatch && phoneMatch && totalMatch) {
          const orderId = `tg-${msg.message_id || msg.date}`;
          if (existingIds.has(orderId)) return;

          const itemsText = text.match(/•\s*(.*)/g) || [];
          const items: CartItem[] = itemsText.map((it: string, idx: number) => {
            const rawName = it.replace('•', '').split('(')[0].trim();
            const qtyMatch = it.match(/x(\d+)/);
            const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
            const foundToy = allToys.find(t => t.name.toLowerCase().includes(rawName.toLowerCase()));

            return {
              id: foundToy?.id || `tg-item-${idx}`,
              name: rawName,
              price: foundToy?.price || 0,
              discountPrice: foundToy?.discountPrice,
              quantity: qty,
              category: foundToy?.category || 'imported',
              ageRange: foundToy?.ageRange || 'any',
              images: foundToy?.images || [DEFAULT_TOY_IMAGE],
              description: foundToy?.description || ''
            };
          });

          newOrders.push({
            id: orderId,
            customerName: nameMatch[1].trim(),
            customerPhone: phoneMatch[1].trim(),
            items: items,
            total: parseInt(totalMatch[1]),
            date: new Date((msg.date || Date.now() / 1000) * 1000).toLocaleString('uk-UA'),
            status: 'new'
          });
        }
      });

      if (newOrders.length > 0) {
        const updated = [...newOrders, ...orders];
        setOrders(updated);
        localStorage.setItem('leopold_orders', JSON.stringify(updated));
        return { success: true, message: `Знайдено та додано ${newOrders.length} замовлень! ✨` };
      }
      return { success: true, message: 'Нових повідомлень із замовленнями не виявлено.' };
    } catch (e) {
      return { success: false, message: 'Помилка мережі при запиті до Telegram.' };
    }
  };

  const handlePlaceOrder = async (name: string, phone: string) => {
    const total = cartItems.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      customerName: name,
      customerPhone: phone,
      items: [...cartItems],
      total,
      date: new Date().toLocaleString('uk-UA'),
      status: 'new'
    };

    const token = settings.telegramToken?.trim();
    const chatId = settings.telegramChatId?.trim();
    if (token && chatId) {
      const itemsText = newOrder.items.map(it => `• ${it.name} (x${it.quantity})`).join('\n');
      const text = `📦 НОВЕ ЗАМОВЛЕННЯ!\n\nКлієнт: ${name}\nТелефон: ${phone}\n\nТовари:\n${itemsText}\n\nЗАГАЛЬНА СУМА: ${total} грн`;
      fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`).catch(() => {});
    }

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('leopold_orders', JSON.stringify(updated));
  };

  const toyOfTheDay = useMemo(() => {
    if (allToys.length === 0) return null;
    return toyOfTheDayId ? allToys.find(t => t.id === toyOfTheDayId) || allToys[0] : allToys[0];
  }, [allToys, toyOfTheDayId]);

  const filteredToys = useMemo(() => {
    return allToys.filter(toy => {
      const isDiscounted = !!toy.discountPrice && toy.discountPrice < toy.price;
      const matchesCategory = selectedCategory === 'all' || (selectedCategory === 'discount' ? isDiscounted : toy.category === selectedCategory);
      return matchesCategory && toy.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [allToys, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredToys.length / ITEMS_PER_PAGE);
  const paginatedToys = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredToys.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredToys, currentPage]);

  const categoryList = useMemo(() => {
    const base = [...categories];
    if (!base.find(c => c.id === 'discount')) {
      base.splice(1, 0, { id: 'discount', name: '🔥 Знижки' });
    }
    return base;
  }, [categories]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleAddToCart = (toy: Toy) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === toy.id);
      return exists 
        ? prev.map(i => i.id === toy.id ? {...i, quantity: i.quantity + 1} : i) 
        : [...prev, {...toy, quantity: 1}];
    });
  };

  if (isLoading) return <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center"> <div className="text-8xl mb-8 animate-bounce">🐱</div> <h2 className="text-3xl font-black text-gray-900">Завантаження...</h2> </div>;

  return (
    <div className="flex flex-col min-h-screen toy-pattern">
      <Navbar 
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        currentView={view} 
        onSwitchView={setView} 
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenInfo={setActiveInfoModal}
      />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 pt-44 md:pt-36 w-full">
        {view === 'shop' ? (
          <>
            <section className="mb-12 rounded-3xl bg-yellow-400 p-8 sm:p-12 text-center shadow-xl border-8 border-white">
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Леопольд: Світ іграшок! 🐱</h1>
              <p className="text-lg sm:text-xl font-bold mb-8 italic">«Хлопці, давайте жити дружньо!»</p>
              <button onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior:'smooth'})} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-colors">До каталогу</button>
            </section>

            <div className="grid lg:grid-cols-2 gap-6 mb-12 items-stretch">
              {toyOfTheDay && (
                <div 
                  onClick={() => setSelectedToyForDetail(toyOfTheDay)}
                  className="bg-white rounded-[32px] p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 shadow-lg border-2 border-dashed border-yellow-400 relative cursor-pointer group h-full"
                >
                  <div className="absolute -top-3 -left-3 bg-orange-500 text-white px-4 py-1.5 font-black rounded-xl rotate-[-5deg] z-10 shadow-xl border-2 border-white text-xs"> ІГРАШКА ДНЯ ✨ </div>
                  <div className="w-full sm:w-2/5 h-48 sm:h-full min-h-[180px] rounded-2xl overflow-hidden bg-gray-50 relative flex-shrink-0">
                    <img src={toyOfTheDay.images[0] || DEFAULT_TOY_IMAGE} alt={toyOfTheDay.name} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" onError={(e) => {e.currentTarget.src = DEFAULT_TOY_IMAGE}} />
                  </div>
                  <div className="flex-1 flex flex-col h-full justify-center">
                    <h3 className="text-xl font-black mb-2 text-black leading-tight">{toyOfTheDay.name}</h3>
                    <p className="text-gray-600 mb-4 font-medium line-clamp-2 text-sm">{toyOfTheDay.description}</p>
                    <div className="flex items-center gap-4 mt-auto">
                      <span className="text-2xl font-black text-orange-600 whitespace-nowrap">{toyOfTheDay.discountPrice || toyOfTheDay.price} ₴</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(toyOfTheDay);
                          setIsCartOpen(true);
                        }} 
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-xl font-black shadow-md transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap"
                      >
                        Хочу таку!
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <AIHelper toys={allToys} onSelectToy={(t) => setSelectedToyForDetail(t)} isCompact />
            </div>

            <div id="catalog" className="scroll-mt-24 mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <h2 className="text-3xl font-black text-gray-900">Каталог іграшок</h2>
                
                {/* Мобільна версія: випадаючий список */}
                <div className="relative min-w-[240px] md:hidden">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => handleSelectCategory(e.target.value)}
                    className="w-full appearance-none bg-white border-4 border-yellow-200 text-gray-900 font-black px-6 py-3 rounded-2xl outline-none focus:border-orange-400 shadow-sm cursor-pointer pr-12 transition-all"
                  >
                    {categoryList.map(cat => (
                      <option key={cat.id} value={cat.id} className="font-bold">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Десктоп версія: кнопки категорій */}
                <div className="hidden md:flex flex-wrap gap-3">
                  {categoryList.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`px-6 py-2 rounded-2xl font-black transition-all border-4 shadow-sm active:scale-95 whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-orange-500 border-orange-500 text-white shadow-orange-200'
                          : 'bg-white border-yellow-200 text-gray-700 hover:border-orange-300 hover:bg-yellow-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                {paginatedToys.length > 0 ? (
                  paginatedToys.map(toy => (
                    <ToyCard 
                      key={toy.id} 
                      toy={toy} 
                      onAddToCart={handleAddToCart}
                      onViewDetails={(t) => setSelectedToyForDetail(t)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border-4 border-dashed border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900">Ми нічого не знайшли за цим запитом. 😿</h3>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pb-12">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => {setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: document.getElementById('catalog')?.offsetTop || 0, behavior: 'smooth' });}} 
                    className="px-6 py-3 rounded-2xl font-black bg-white border-2 border-gray-100 text-gray-700 disabled:opacity-30 hover:border-orange-400 transition-all"
                  > ← Попередня </button>
                  <span className="font-black text-gray-900">Сторінка {currentPage} з {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => {setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: document.getElementById('catalog')?.offsetTop || 0, behavior: 'smooth' });}} 
                    className="px-6 py-3 rounded-2xl font-black bg-white border-2 border-gray-100 text-gray-700 disabled:opacity-30 hover:border-orange-400 transition-all"
                  > Наступна → </button>
                </div>
              )}
            </div>
          </>
        ) : (
          isAdminAuthenticated ? (
            <AdminPanel 
              toys={allToys} categories={categories} orders={orders} toyOfTheDayId={toyOfTheDayId} settings={settings} 
              onAddToy={(t) => setAllToys(prev => [t, ...prev])} 
              onAddToys={(ts) => setAllToys(prev => [...ts, ...prev])} 
              onUpdateToy={(t) => setAllToys(prev => prev.map(i => i.id === t.id ? t : i))} 
              onDeleteToy={(id) => setAllToys(prev => prev.filter(i => i.id !== id))} 
              onAddCategory={(n) => setCategories(prev => [...prev, {id: n.toLowerCase().replace(/\s+/g, '-'), name: n}])} 
              onDeleteCategory={(id) => setCategories(prev => prev.filter(c => c.id !== id))} 
              onSetToyOfTheDay={setToyOfTheDayId} 
              onLogout={() => {setIsAdminAuthenticated(false); setView('shop'); sessionStorage.removeItem('leopold_admin_auth');}} 
              onSync={syncWithGoogleSheet} 
              onRemoveOrder={(id) => setOrders(prev => prev.filter(o => o.id !== id))} 
              onToggleOrderStatus={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: o.status === 'new' ? 'completed' : 'new'} : o))} 
              onSaveSettings={handleSaveSettings} 
              onTestTelegram={handleTestTelegram} 
              onSyncOrdersFromTelegram={syncOrdersFromTelegram} 
            />
          ) : <AdminLogin onLogin={() => {setIsAdminAuthenticated(true); sessionStorage.setItem('leopold_admin_auth', 'true');}} onCancel={() => setView('shop')} />
        )}
      </main>

      <footer className="bg-gray-900 text-white py-12 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl font-bold mb-2">Леопольд — Магазин Іграшок</p>
          <div className="flex justify-center gap-6 mb-6 text-sm font-bold"> 
            <button onClick={() => setActiveInfoModal('contacts')} className="text-gray-400 hover:text-orange-400 transition-colors">Контакти</button> 
            <button onClick={() => setActiveInfoModal('delivery')} className="text-gray-400 hover:text-orange-400 transition-colors">Доставка та оплата</button> 
          </div>
          <p className="text-gray-500 text-xs">© 2025 Всі права захищені. Давайте жити дружньо!</p>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={(id) => setCartItems(prev => prev.filter(i => i.id !== id))} onUpdateQuantity={(id, delta) => setCartItems(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))} onClearCart={() => setCartItems([])} onPlaceOrder={handlePlaceOrder} />
      
      {activeInfoModal && <InfoModal type={activeInfoModal} onClose={() => setActiveInfoModal(null)} />}
      
      {selectedToyForDetail && (
        <ToyDetailModal 
          toy={selectedToyForDetail} 
          onClose={() => setSelectedToyForDetail(null)} 
          onAddToCart={(t) => {
            handleAddToCart(t);
            setIsCartOpen(true);
            setSelectedToyForDetail(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
