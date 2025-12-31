
import React from 'react';

interface InfoModalProps {
  type: 'contacts' | 'delivery';
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  const isContacts = type === 'contacts';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 border-4 border-yellow-100">
        <div className="bg-orange-500 p-6 flex items-center justify-between text-white">
          <h2 className="text-2xl font-black">
            {isContacts ? '📍 Контакти' : '🚚 Доставка та оплата'}
          </h2>
          <button onClick={onClose} className="hover:bg-orange-600 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          {isContacts ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-1">Наша адреса</p>
                <p className="text-gray-900 font-bold text-lg">м. Хмельницький</p>
              </div>
              <div>
                <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-1">Телефон</p>
                <p className="text-gray-900 font-bold text-lg">+380 00 000 00 00</p>
              </div>
              <div>
                <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-1">Графік роботи</p>
                <p className="text-gray-900 font-bold">Пн-Нд: 10:00 — 19:00<br/>Без вихідних та перерв</p>
              </div>
              <div className="pt-4 border-t border-gray-100 italic text-gray-500 text-sm">
                «Хлопці, давайте жити дружньо та заходити в гості!» — Ваш Леопольд 🐱
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-1">Доставка по Україні</p>
                <ul className="list-disc list-inside text-gray-900 font-bold space-y-1">
                  <li>Нова Пошта (відділення або кур'єр)</li>
                  <li>Укрпошта</li>
                  <li>Самовивіз у Хмельницькому (безкоштовно)</li>
                  <li>Доставка по місту при замовленні від 500 грн (безкоштовно)</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-1">Оплата</p>
                <ul className="list-disc list-inside text-gray-900 font-bold space-y-1">
                  
                  <li>Оплата при отриманні (накладений платіж)</li>
                  <li>Готівкою в магазині</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-blue-800 text-sm font-bold">✨ Безкоштовна доставка при замовленні від 2000 ₴!</p>
              </div>
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-colors shadow-lg"
          >
            Зрозуміло!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
