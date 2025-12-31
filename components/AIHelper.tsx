
import React, { useState, useEffect, useRef } from 'react';
import { getToyRecommendations } from '../services/geminiService';
import { RecommendedToy, Toy } from '../types';

interface AIHelperProps {
  toys: Toy[];
  onSelectToy: (toy: Toy) => void;
  isCompact?: boolean;
}

const LOADING_MESSAGES = [
  "Леопольд шукає на найвищих полицях... 🐾",
  "Радимося з мишенятами щодо вибору... 🐭",
  "Перевіряємо, що найцікавіше для вашого віку... 🧸",
  "Майже знайшли ідеальний варіант... ✨",
  "Готуємо добру пораду для вас... 🐱"
];

const AIHelper: React.FC<AIHelperProps> = ({ toys, onSelectToy, isCompact }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendedToy[]>([]);
  const [loading, setLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      setMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Закриття при кліку поза межами вікна (втрата фокусу) або натисканні Escape
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setIsOpen(false);
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Заборона скролу фону
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !interests || toys.length === 0) return;
    setLoading(true);
    try {
      const result = await getToyRecommendations(age, interests, toys);
      setRecommendations(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToyClick = (rec: RecommendedToy) => {
    const foundToy = toys.find(t => t.id === rec.toyId);
    if (foundToy) {
      onSelectToy(foundToy);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Статична картка в сітці (ніколи не змінює розмір і не зміщує контент) */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] px-6 py-8 text-white shadow-lg overflow-hidden relative border-4 border-white/10 flex flex-col justify-center h-full min-h-[220px]">
        <div className="absolute -right-6 -bottom-6 opacity-10 transform rotate-12 pointer-events-none">
          <span className="text-8xl sm:text-9xl">🐱</span>
        </div>
        
        <div className="relative z-10 text-center sm:text-left">
          <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 shadow-md">
            Леопольд-Помічник ✨
          </div>
          <h2 className="text-2xl font-black mb-2 leading-tight">Вагаєтесь з вибором?</h2>
          <p className="text-indigo-100 text-sm mb-6 opacity-90 font-medium">
            Я підкажу, яка іграшка підійде саме вашій дитині!
          </p>
          
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-white text-indigo-600 hover:bg-yellow-400 hover:text-gray-900 px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center gap-2 mx-auto sm:mx-0 transform hover:scale-105 active:scale-95"
          >
            Підібрати ідею 🐾
          </button>
        </div>
      </section>

      {/* Модальний оверлей (збільшується поверх інших вікон) */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-indigo-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            ref={modalRef}
            className="bg-white rounded-[32px] sm:rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden border-4 sm:border-8 border-white animate-in zoom-in duration-300 relative"
          >
            {/* Шапка модалки */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 sm:p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-inner">🐱</div>
                <div>
                  <h3 className="font-black text-sm sm:text-lg">Поради Леопольда</h3>
                  <p className="text-[9px] sm:text-[10px] opacity-80 uppercase font-black tracking-widest italic">Давайте жити дружньо!</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Контент модалки - Оптимізовані відступи (p-3 для мобільних) */}
            <div className="p-3 sm:p-5 bg-gray-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-5">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse-soft">
                      <span className="text-2xl">🐱</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-indigo-900 mb-1 transition-all duration-500">
                      {LOADING_MESSAGES[msgIndex]}
                    </p>
                    <p className="text-gray-400 text-xs font-bold italic">Заварюємо чай з ромашкою...</p>
                  </div>
                </div>
              ) : !recommendations.length ? (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <p className="text-gray-600 font-bold text-sm sm:text-base mb-2">Розкажіть про дитину:</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Вік дитини</label>
                      <input 
                        required
                        type="number" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Наприклад: 5"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl outline-none font-bold text-gray-900 focus:border-indigo-500 shadow-sm transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Захоплення</label>
                      <input 
                        required
                        type="text" 
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="Космос, малювання, авто..."
                        className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl outline-none font-bold text-gray-900 focus:border-indigo-500 shadow-sm transition-all text-sm"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={!age || !interests}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black py-4 rounded-2xl text-base shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-2"
                  >
                    Знайди ідеальну іграшку ✨
                  </button>
                </form>
              ) : (
                <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-gray-900 text-lg sm:text-xl">Мої поради:</h4>
                    <button 
                      onClick={() => setRecommendations([])} 
                      className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      Змінити
                    </button>
                  </div>
                  
                  <div className="grid gap-2 sm:gap-3 max-h-[450px] overflow-y-auto pr-1 no-scrollbar">
                    {recommendations.map((rec, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleToyClick(rec)}
                        className="text-left w-full bg-white hover:bg-indigo-50 p-3 sm:p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 transition-all flex items-start gap-3 sm:gap-4 group shadow-sm"
                      >
                        <div className="bg-yellow-400 text-gray-900 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black flex-shrink-0 text-xs sm:text-sm shadow-md group-hover:rotate-6 transition-transform">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-black text-gray-900 truncate text-sm sm:text-base">{rec.name}</p>
                            <span className="text-indigo-600 font-black text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">Перейти →</span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-0.5 italic">
                            "{rec.reason}"
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors text-xs"
                  >
                    Повернутися до покупок
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIHelper;
