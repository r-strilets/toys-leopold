
import React, { useState, useRef } from 'react';
import { Toy } from '../types';
import { DEFAULT_TOY_IMAGE, CATEGORIES } from '../constants';

interface ToyCardProps {
  toy: Toy;
  onAddToCart: (toy: Toy) => void;
  onViewDetails: (toy: Toy) => void;
}

const ToyCard: React.FC<ToyCardProps> = ({ toy, onAddToCart, onViewDetails }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const images = toy.images && toy.images.length > 0 ? toy.images : [DEFAULT_TOY_IMAGE];
  const hasDiscount = !!toy.discountPrice && toy.discountPrice < toy.price;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // Поріг свайпа
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    touchStartX.current = null;
  };

  return (
    <div 
      onClick={() => onViewDetails(toy)}
      className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border-2 border-yellow-100 flex flex-col group relative cursor-pointer hover:-translate-y-1"
    >
      {/* Контейнер зображення */}
      <div 
        className="relative h-64 lg:h-72 overflow-hidden bg-gray-50 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={images[currentImgIndex]} 
          alt={toy.name} 
          onError={(e) => { e.currentTarget.src = DEFAULT_TOY_IMAGE }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out select-none pointer-events-none"
        />
        
        {images.length > 1 && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
        )}

        {/* Бейдж кількості фото */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] px-2.5 py-1 rounded-full font-black z-20 flex items-center gap-1.5 shadow-sm border border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>{currentImgIndex + 1} / {images.length}</span>
          </div>
        )}

        {/* Пагінація крапками */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImgIndex 
                    ? 'w-4 bg-orange-500 shadow-sm' 
                    : 'w-1.5 bg-gray-300/80'
                }`}
              />
            ))}
          </div>
        )}

        {/* Кнопки навігації (тільки для десктопа) */}
        {images.length > 1 && (
          <div className="hidden lg:block">
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 rounded-full shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 rounded-full shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Ціна та Знижка */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-2xl text-sm font-black shadow-lg z-10 border-2 border-white ${hasDiscount ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-400 text-gray-900'}`}>
          {hasDiscount ? toy.discountPrice : toy.price} ₴
        </div>
        
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] px-2.5 py-1.5 rounded-xl font-black shadow-md uppercase tracking-tight border-2 border-white">
            Акція!
          </div>
        )}

        {/* Вік */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="text-white text-[10px] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg font-black border border-white/20">
            {toy.ageRange}
          </span>
        </div>
      </div>
      
      {/* Контент картки */}
      <div className="p-6 flex-1 flex flex-col bg-white">
        <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-500 transition-colors leading-tight mb-3 line-clamp-2">
          {toy.name}
        </h3>
        
        <div className="flex items-center gap-3 mb-4">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-black text-orange-600">{toy.discountPrice} ₴</span>
              <span className="text-sm text-gray-400 line-through font-bold">{toy.price} ₴</span>
            </>
          ) : (
            <span className="text-2xl font-black text-gray-900">{toy.price} ₴</span>
          )}
        </div>

        <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2 font-medium">
          {toy.description}
        </p>
        
        <div className="mt-auto">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(toy);
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-[20px] font-black transition-all shadow-md hover:shadow-orange-200 flex items-center justify-center gap-2 transform active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            Купити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToyCard;
