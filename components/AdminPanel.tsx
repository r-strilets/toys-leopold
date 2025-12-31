
import React, { useState, useMemo, useEffect } from 'react';
import { Toy, Category, Order, ShopSettings } from '../types';
import { DEFAULT_TOY_IMAGE } from '../constants';

interface AdminPanelProps {
  toys: Toy[];
  categories: Category[];
  orders: Order[];
  toyOfTheDayId: string | null;
  settings: ShopSettings;
  onAddToy: (toy: Toy) => void;
  onAddToys: (toys: Toy[]) => void;
  onUpdateToy: (toy: Toy) => void;
  onDeleteToy: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onSetToyOfTheDay: (id: string) => void;
  onLogout: () => void;
  onSync: (url?: string) => Promise<boolean>;
  onRemoveOrder: (id: string) => void;
  onToggleOrderStatus: (id: string) => void;
  onSaveSettings: (settings: ShopSettings) => void;
  onTestTelegram: (settings: ShopSettings) => Promise<boolean>;
  onSyncOrdersFromTelegram: () => Promise<{ success: boolean; message: string }>;
}

const ADMIN_PAGE_SIZE = 12;

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  toys, 
  categories, 
  orders,
  toyOfTheDayId,
  settings,
  onAddToy, 
  onAddToys,
  onUpdateToy,
  onDeleteToy, 
  onAddCategory, 
  onDeleteCategory, 
  onSetToyOfTheDay,
  onLogout,
  onSync,
  onRemoveOrder,
  onToggleOrderStatus,
  onSaveSettings,
  onTestTelegram,
  onSyncOrdersFromTelegram
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [inlineCategoryName, setInlineCategoryName] = useState('');
  const [customSheetUrl, setCustomSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingTg, setIsTestingTg] = useState(false);
  const [editingToyId, setEditingToyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchQuery] = useState('');
  
  const [tgToken, setTgToken] = useState(settings.telegramToken);
  const [tgChatId, setTgChatId] = useState(settings.telegramChatId);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'toy' | 'category' | 'order';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'toy', id: '', name: '' });

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    category: categories.length > 0 ? categories[0].id : 'all',
    ageRange: '',
    images: [] as string[],
    description: ''
  });

  const [tempImageUrl, setTempImageUrl] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const filteredToys = useMemo(() => {
    if (!searchTerm.trim()) return toys;
    const lowerTerm = searchTerm.toLowerCase();
    return toys.filter(toy => toy.name.toLowerCase().includes(lowerTerm));
  }, [toys, searchTerm]);

  const totalPages = Math.ceil(filteredToys.length / ADMIN_PAGE_SIZE);

  const paginatedToys = useMemo(() => {
    const start = (currentPage - 1) * ADMIN_PAGE_SIZE;
    return filteredToys.slice(start, start + ADMIN_PAGE_SIZE);
  }, [filteredToys, currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addImageUrl = () => {
    if (!tempImageUrl.trim()) return;
    setFormData(prev => ({ ...prev, images: [...prev.images, tempImageUrl.trim()] }));
    setTempImageUrl('');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const setMainImage = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      const selected = newImages.splice(index, 1)[0];
      newImages.unshift(selected);
      return { ...prev, images: newImages };
    });
    setNotification('Головне фото змінено!');
    setTimeout(() => setNotification(''), 2000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const success = await onSync(customSheetUrl.trim() || undefined);
      if (success) {
        setNotification('Товари успішно завантажені! ✨');
        setCustomSheetUrl('');
      } else {
        setNotification('Помилка завантаження.');
      }
    } catch (e) {
      setNotification('Помилка мережі.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const handleExportCSV = () => {
    if (toys.length === 0) return;
    const headers = ['Найменування', 'Ціна', 'Оптова ціна', 'Категорія', 'Вік', 'Фото', 'Опис'];
    const csvRows = [headers.join(',')];
    toys.forEach(toy => {
      const row = [`"${toy.name}"`, toy.price, toy.discountPrice || '', `"${toy.category}"`, `"${toy.ageRange}"`, `"${toy.images.join(';')}"`, `"${toy.description}"`];
      csvRows.push(row.join(','));
    });
    const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory.csv`;
    link.click();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({ telegramToken: tgToken.trim(), telegramChatId: tgChatId.trim() });
    setNotification('Налаштування збережено! ⚙️');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleTestTg = async () => {
    if (!tgToken.trim() || !tgChatId.trim()) {
      setNotification('Введіть Token та Chat ID');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    setIsTestingTg(true);
    const success = await onTestTelegram({ telegramToken: tgToken.trim(), telegramChatId: tgChatId.trim() });
    setIsTestingTg(false);
    if (success) {
      setNotification('Тестове повідомлення надіслано! ✅');
    } else {
      setNotification('Помилка! Перевірте Chat ID.');
    }
    setTimeout(() => setNotification(''), 5000);
  };

  const handleQuickAddCategory = () => {
    if (!inlineCategoryName.trim()) return;
    const catId = inlineCategoryName.toLowerCase().replace(/\s+/g, '-');
    onAddCategory(inlineCategoryName.trim());
    setFormData(prev => ({ ...prev, category: catId }));
    setInlineCategoryName('');
    setNotification('Нову категорію створено та обрано! 🏷️');
    setTimeout(() => setNotification(''), 3000);
  };

  const openConfirmModal = (type: 'toy' | 'category' | 'order', id: string, name: string) => {
    setConfirmModal({ isOpen: true, type, id, name });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const executeDelete = () => {
    if (confirmModal.type === 'toy') onDeleteToy(confirmModal.id);
    else if (confirmModal.type === 'category') onDeleteCategory(confirmModal.id);
    else onRemoveOrder(confirmModal.id);
    closeConfirmModal();
    setNotification('Видалено');
    setTimeout(() => setNotification(''), 3000);
  };

  const startEditing = (toy: Toy) => {
    setEditingToyId(toy.id);
    setFormData({
      name: toy.name,
      price: toy.price.toString(),
      discountPrice: toy.discountPrice ? toy.discountPrice.toString() : '',
      category: toy.category,
      ageRange: toy.ageRange,
      images: toy.images || [],
      description: toy.description
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingToyId(null);
    setFormData({ name: '', price: '', discountPrice: '', category: categories[0]?.id || 'all', ageRange: '', images: [], description: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    const toyData: Toy = {
      id: editingToyId || Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
      category: formData.category,
      ageRange: formData.ageRange || '3+',
      images: formData.images.length > 0 ? formData.images : [DEFAULT_TOY_IMAGE],
      description: formData.description || formData.name
    };
    if (editingToyId) onUpdateToy(toyData);
    else onAddToy(toyData);
    cancelEditing();
    setNotification(editingToyId ? 'Оновлено!' : 'Додано!');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Адмін-панель</h1>
        <div className="flex flex-wrap gap-2 bg-gray-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('products')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-black transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500'}`}>📦 Товари</button>
           <button onClick={() => setActiveTab('settings')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-black transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500'}`}>⚙️ Налаштування</button>
           <div className="hidden sm:block w-px bg-gray-200 mx-1"></div>
           <button onClick={onLogout} className="flex-1 sm:flex-none px-4 py-2 text-gray-400 font-bold hover:text-red-500 transition-colors whitespace-nowrap">Вихід</button>
        </div>
      </div>

      {notification && (
        <div className="fixed top-24 right-4 z-[100] bg-orange-600 text-white px-6 py-3 rounded-2xl font-black shadow-2xl animate-in slide-in-from-right max-w-xs sm:max-w-md">
          ✨ {notification}
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-red-100 text-center">
            <h3 className="text-xl font-black text-gray-900 mb-6">Видалити {confirmModal.name}?</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={closeConfirmModal} className="w-full px-4 py-3 bg-gray-400 text-white rounded-2xl font-black hover:bg-gray-500 transition-colors">Скасувати</button>
              <button onClick={executeDelete} className="w-full px-4 py-3 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 shadow-lg transition-colors">Видалити</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-4 border-blue-50">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-900 text-center justify-center">
            <span className="text-3xl">📡</span> Telegram
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Bot Token</label>
              <input type="text" value={tgToken} onChange={(e) => setTgToken(e.target.value)} placeholder="0000000000:AAEb..." className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none font-bold text-gray-900 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Ваш Chat ID</label>
              <input type="text" value={tgChatId} onChange={(e) => setTgChatId(e.target.value)} placeholder="Наприклад: 123456789" className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none font-bold text-gray-900 focus:border-blue-400" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={handleTestTg} disabled={isTestingTg} className="w-full bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all disabled:opacity-50">
                {isTestingTg ? 'Надсилаю...' : 'Тест зв\'язку'}
              </button>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">
                Зберегти
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-12">
            <div className="bg-blue-600 rounded-3xl p-5 sm:p-6 mb-2 shadow-xl text-white flex flex-col gap-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl">📊</span>
                  <h2 className="text-lg sm:text-xl font-black">Управління базою</h2>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                  <button onClick={handleExportCSV} className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black bg-green-500 text-white hover:bg-green-600 border-2 border-white/20">📥 Експорт CSV</button>
                  <button onClick={handleManualSync} disabled={isSyncing} className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition-all">
                    {isSyncing ? '...' : '🔄 Оновити основну'}
                  </button>
                </div>
              </div>

              <div className="bg-blue-700/40 p-4 rounded-2xl border-2 border-blue-400/30">
                <label className="block text-xs font-black uppercase mb-2 ml-1 text-blue-100">Додати з іншої таблиці (CSV URL)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={customSheetUrl} 
                    onChange={(e) => setCustomSheetUrl(e.target.value)} 
                    placeholder="Вставте посилання на публічний CSV..." 
                    className="flex-1 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl outline-none font-bold text-white placeholder-blue-200 focus:border-white transition-colors !bg-blue-800/50"
                  />
                  <button 
                    onClick={handleManualSync} 
                    disabled={isSyncing || !customSheetUrl.trim()}
                    className="px-6 py-3 bg-white text-blue-700 rounded-xl font-black hover:bg-blue-50 disabled:opacity-30 transition-all whitespace-nowrap shadow-md"
                  >
                    Імпортувати
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-blue-200 font-bold italic">Примітка: Файл має бути опублікований як CSV у меню "Файл &gt; Поділитися &gt; Опублікувати в інтернеті"</p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-4 border-blue-100">
              <h2 className="text-xl sm:text-2xl font-black mb-6 text-gray-900">Всі Категорії</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                    <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                    {cat.id !== 'all' && <button onClick={() => openConfirmModal('category', cat.id, cat.name)} className="text-gray-400 hover:text-red-500 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">✖</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-4 border-yellow-100">
              <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3 text-gray-900">🧸 {editingToyId ? 'Редагувати' : 'Новий товар'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-gray-700 uppercase mb-2 ml-1 text-gray-500">Назва товару</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none font-bold text-gray-900 focus:border-yellow-400 transition-colors" />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 bg-orange-50 p-4 sm:p-6 rounded-2xl border-2 border-orange-100">
                    <label className="block text-xs font-black text-orange-700 uppercase mb-4 ml-1">Категорія товару</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-orange-400 mb-1 ml-1">ОБРАТИ ІСНУЮЧУ</p>
                        <div className="relative">
                          <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-xl outline-none font-black text-gray-900 focus:border-orange-500 shadow-sm appearance-none cursor-pointer pr-12"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-orange-400 mb-1 ml-1">АБО ДОДАТИ НОВУ</p>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={inlineCategoryName} 
                            onChange={(e) => setInlineCategoryName(e.target.value)} 
                            placeholder="Назва..." 
                            className="flex-1 px-4 py-3 bg-white border-2 border-orange-200 rounded-xl outline-none font-bold text-gray-900 focus:border-orange-500"
                          />
                          <button 
                            type="button" 
                            onClick={handleQuickAddCategory}
                            className="bg-orange-500 text-white px-4 rounded-xl font-black hover:bg-orange-600 transition-colors shadow-md"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase mb-2 ml-1 text-gray-500">Вік</label>
                    <input type="text" name="ageRange" value={formData.ageRange} onChange={handleInputChange} placeholder="3+" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none font-bold text-gray-900 focus:border-yellow-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-gray-700 uppercase mb-2 ml-1 text-gray-500">Ціна (₴)</label>
                      <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none font-bold text-gray-900 focus:border-yellow-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-700 uppercase mb-2 ml-1 text-gray-500">Знижка (₴)</label>
                      <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} placeholder="-" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none font-bold text-gray-900 focus:border-yellow-400" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-2 ml-1 text-gray-500">Опис товару</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none font-bold text-gray-900 focus:border-yellow-400"></textarea>
                </div>
                
                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border-2 border-gray-100">
                  <label className="block text-xs font-black text-gray-700 uppercase mb-4 ml-1">Фото (URL-посилання)</label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input type="text" value={tempImageUrl} onChange={(e) => setTempImageUrl(e.target.value)} placeholder="https://..." className="flex-1 px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-gray-900 font-bold focus:border-blue-400 outline-none" />
                    <button type="button" onClick={addImageUrl} className="w-full sm:w-auto bg-blue-500 text-white px-6 py-3 rounded-xl font-black shadow-md hover:bg-blue-600 transition-colors">Додати</button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  {editingToyId && <button type="button" onClick={cancelEditing} className="w-full sm:flex-1 bg-gray-200 py-4 rounded-2xl font-black text-gray-900 hover:bg-gray-300 transition-colors">Скасувати</button>}
                  <button type="submit" className={`w-full ${editingToyId ? 'sm:flex-[2]' : 'flex-1'} bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all active:scale-95`}>
                    {editingToyId ? 'Оновити товар' : 'Зберегти товар'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-4 border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">Товари ({filteredToys.length})</h2>
                <div className="relative w-full sm:w-auto">
                  <input type="text" value={searchTerm} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Пошук..." className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none font-bold text-gray-900 text-sm focus:border-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedToys.map(toy => (
                  <div key={toy.id} className="p-3 sm:p-4 rounded-2xl bg-gray-50 group hover:bg-white border-2 border-transparent hover:border-orange-200 transition-all shadow-sm">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                        <img src={toy.images[0] || DEFAULT_TOY_IMAGE} className="w-full h-full rounded-xl object-cover" onError={(e) => e.currentTarget.src = DEFAULT_TOY_IMAGE} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs sm:text-sm truncate text-gray-900 pr-2">{toy.name}</h4>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => startEditing(toy)} className="text-blue-500 font-black text-lg">✎</button>
                            <button onClick={() => openConfirmModal('toy', toy.id, toy.name)} className="text-red-500 font-black text-lg">✖</button>
                          </div>
                        </div>
                        <p className="text-orange-600 font-black text-xs sm:text-sm mt-1">{toy.discountPrice || toy.price} ₴</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8 pt-4 border-t border-gray-100">
                   <button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); }} className="p-2 rounded-xl bg-gray-100 disabled:opacity-30">◀</button>
                   <span className="text-sm font-black text-gray-600">{currentPage} / {totalPages}</span>
                   <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); }} className="p-2 rounded-xl bg-gray-100 disabled:opacity-30">▶</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
