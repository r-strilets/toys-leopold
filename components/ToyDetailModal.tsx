
import React, { useState, useRef, useEffect } from 'react';
import { Toy } from '../types';
import { DEFAULT_TOY_IMAGE, CATEGORIES } from '../constants';

interface ToyDetailModalProps {
  toy: Toy;
  onClose: () => void;
  onAddToCart: (toy: Toy) => void;
}

const ToyDetailModal: React.FC<ToyDetailModalProps> = ({ toy, onClose, onAddToCart }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  
  const images = toy.images && toy.images.length > 0 ? toy.images : [DEFAULT_TOY_IMAGE];
  const hasDiscount = !!toy.discountPrice && toy.discountPrice < toy.price;
  const categoryName = CATEGORIES.find(c => c.id === toy.category)?.name || toy.category;

  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (modalContentRef.current && modalContentRef.current.scrollTop > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const modalElement = modalContentRef.current;
    if (modalElement) {
      modalElement.addEventListener('scroll', handleScroll);
    }
    return () => modalElement?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        ref={modalContentRef}
        className="bg-white rounded-[40px] w-full max-w-6xl max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl animate-in zoom-in duration-300 border-8 border-yellow-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закриття */}
        <button 
          onClick={onClose}
          className="fixed lg:absolute top-6 right-6 z-[110] lg:z-30 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg text-gray-800 transition-all hover:rotate-90 active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Індикатор скролу (тільки мобільні) */}
        {!isScrolled && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] lg:hidden animate-bounce flex flex-col items-center pointer-events-none">
            <span className="text-[10px] font-black text-orange-600 bg-white/80 px-3 py-1 rounded-full shadow-sm mb-1 uppercase tracking-tighter">Скрольте вниз</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Ліва колонка: Галерея-Слайдер */}
          <div className="p-8 lg:p-12 bg-gray-50 flex flex-col justify-center border-r border-gray-100">
            <div 
              className="relative aspect-square rounded-[32px] overflow-hidden shadow-inner border-4 border-white bg-white group/slider touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={images[currentImgIndex]} 
                alt={toy.name}
                className="w-full h-full object-contain p-6 transition-all duration-500 select-none pointer-events-none"
                onError={(e) => e.currentTarget.src = DEFAULT_TOY_IMAGE}
              />
              
              {/* Навігаційні стрілки в слайдері (тільки десктоп) */}
              {images.length > 1 && (
                <div className="hidden lg:block">
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full shadow-xl z-20 opacity-0 group-hover/slider:opacity-100 transition-all hover:scale-110 active:scale-90 text-gray-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full shadow-xl z-20 opacity-0 group-hover/slider:opacity-100 transition-all hover:scale-110 active:scale-90 text-gray-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Лічильник та підказка свайпу */}
              {images.length > 1 && (
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  <div className="bg-black/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-black shadow-sm z-20">
                    {currentImgIndex + 1} / {images.length}
                  </div>
                  <div className="lg:hidden bg-orange-500/80 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">
                    Свайп 👉
                  </div>
                </div>
              )}

              {hasDiscount && (
                <div className="absolute top-6 left-6 bg-red-500 text-white px-5 py-2 rounded-2xl font-black shadow-lg animate-bounce text-sm lg:text-base z-10">
                  АКЦІЯ! 🔥
                </div>
              )}
            </div>
            
            {/* Мініатюри */}
            {images.length > 1 && (
              <div className="flex flex-wrap gap-3 mt-8 justify-center overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border-4 transition-all ${idx === currentImgIndex ? 'border-orange-500 scale-110 shadow-md ring-4 ring-orange-50' : 'border-white hover:border-orange-200'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = DEFAULT_TOY_IMAGE} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Права колонка: Інформація */}
          <div className="p-8 lg:p-16 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-xl text-xs lg:text-sm font-black uppercase tracking-widest">
                {categoryName}
              </span>
              <span className="bg-orange-100 text-orange-700 px-5 py-2 rounded-xl text-xs lg:text-sm font-black">
                Вік: {toy.ageRange}
              </span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-8 leading-tight">
              {toy.name}
            </h2>

            <div className="flex items-center gap-6 mb-10">
              {hasDiscount ? (
                <>
                  <span className="text-4xl lg:text-6xl font-black text-orange-600">{toy.discountPrice} ₴</span>
                  <span className="text-xl lg:text-2xl text-gray-400 line-through font-bold">{toy.price} ₴</span>
                </>
              ) : (
                <span className="text-4xl lg:text-6xl font-black text-gray-900">{toy.price} ₴</span>
              )}
            </div>

            <div className="prose prose-orange max-w-none mb-12">
              <h4 className="text-gray-400 font-black uppercase text-xs lg:text-sm mb-4 tracking-wider">Про цей товар</h4>
              <p className="text-gray-700 text-lg lg:text-xl leading-relaxed font-medium">
                {toy.description}
              </p>
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => onAddToCart(toy)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 lg:py-7 rounded-[28px] lg:rounded-[32px] font-black text-xl lg:text-2xl transition-all shadow-xl hover:shadow-orange-200 flex items-center justify-center gap-4 transform active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Додати в кошик
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToyDetailModal;
