
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';
import { DEFAULT_TOY_IMAGE } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  onPlaceOrder: (name: string, phone: string) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity, onClearCart, onPlaceOrder }) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '+380' });
  const [errors, setErrors] = useState({ name: '', phone: '' });

  // Скидання кроку до "кошика" при кожному відкритті, щоб користувач міг змінити кількість товарів
  useEffect(() => {
    if (isOpen) {
      setStep('cart');
    }
  }, [isOpen]);

  const getItemPrice = (item: CartItem) => item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price;
  const total = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  const handleNextStep = () => setStep('checkout');

  // Валідація імені: тільки літери та пробіли
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-Zа-яА-ЯіїєґІЇЄҐ\s-]/g, '');
    setCustomerInfo(prev => ({ ...prev, name: filteredValue }));
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
  };

  // Валідація телефону: +380 + 9 цифр
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Забороняємо видаляти префікс +380
    if (!value.startsWith('+380')) {
      value = '+380';
    }

    // Отримуємо частину після префікса і залишаємо тільки цифри
    const suffix = value.slice(4).replace(/\D/g, '');
    
    // Обмежуємо довжину суфікса 9 цифрами
    const limitedSuffix = suffix.slice(0, 9);
    
    const finalValue = '+380' + limitedSuffix;
    setCustomerInfo(prev => ({ ...prev, phone: finalValue }));
    
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    const newErrors = { name: '', phone: '' };

    if (customerInfo.name.trim().length < 2) {
      newErrors.name = 'Введіть коректне ім\'я';
      hasError = true;
    }

    if (customerInfo.phone.length !== 13) {
      newErrors.phone = 'Номер має містити 9 цифр після +380';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }
    
    onPlaceOrder(customerInfo.name, customerInfo.phone);
    setStep('success');
  };

  const handleReturnToSite = () => {
    onClearCart();
    setStep('cart');
    setCustomerInfo({ name: '', phone: '+380' });
    onClose();
  };

  if (!isOpen) return null;

  const isPhoneComplete = customerInfo.phone.length === 13;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
          
          <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
            <div className="flex items-start justify-between border-b pb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">
                {step === 'cart' ? 'Ваш кошик' : step === 'checkout' ? 'Оформлення' : 'Успіх!'}
              </h2>
              <button onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-8">
              {step === 'success' ? (
                <div className="text-center py-12 animate-in zoom-in duration-500">
                  <div className="text-8xl mb-6">🐱✨</div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4">Дякуємо за покупку!</h3>
                  <p className="text-gray-600 text-lg mb-8 px-4">
                    Ми отримали ваше замовлення і зателефонуємо вам якнайшвидше!
                  </p>
                  <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200 mb-8 italic text-yellow-800">
                    «Хлопці, давайте жити дружньо!»
                  </div>
                  <button 
                    onClick={handleReturnToSite}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95"
                  >
                    Перейти на сайт
                  </button>
                </div>
              ) : step === 'checkout' ? (
                <div className="animate-in slide-in-from-right">
                   <p className="text-gray-600 mb-8 font-bold">Будь ласка, залиште ваші контакти, щоб ми могли підтвердити замовлення.</p>
                   <form onSubmit={handleSubmitOrder} className="space-y-6">
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-2">Ваше ім'я (тільки літери)</label>
                        <input 
                          required
                          type="text" 
                          value={customerInfo.name}
                          onChange={handleNameChange}
                          placeholder="Ваше ім'я"
                          className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl outline-none font-bold text-gray-900 focus:border-orange-400 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-100'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-2">Номер телефону (+380 та 9 цифр)</label>
                        <input 
                          required
                          type="tel" 
                          value={customerInfo.phone}
                          onChange={handlePhoneChange}
                          placeholder="+380"
                          className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl outline-none font-bold text-gray-900 focus:border-orange-400 transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-100'}`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone}</p>}
                        <p className="text-gray-400 text-[10px] mt-1 italic">Формат: +380XXXXXXXXX (залишилось цифр: {Math.max(0, 13 - customerInfo.phone.length)})</p>
                      </div>
                      <div className="pt-4 space-y-3">
                        <button 
                          type="submit"
                          disabled={!isPhoneComplete || customerInfo.name.length < 2}
                          className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95 ${
                            isPhoneComplete && customerInfo.name.length >= 2 
                              ? 'bg-orange-500 text-white hover:bg-orange-600' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Підтвердити замовлення
                        </button>
                        <button 
                          type="button"
                          onClick={() => setStep('cart')}
                          className="w-full text-gray-500 font-bold hover:text-gray-900 transition-colors"
                        >
                          Повернутися до кошика
                        </button>
                      </div>
                   </form>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🧸</div>
                  <p className="text-gray-500 font-bold">Кошик порожній. Час знайти нову іграшку!</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const price = getItemPrice(item);
                    return (
                      <li key={item.id} className="py-6 flex">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img src={item.images[0] || DEFAULT_TOY_IMAGE} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-bold text-gray-900">
                              <h3 className="line-clamp-1">{item.name}</h3>
                              <p className="ml-4 whitespace-nowrap">{price * item.quantity} ₴</p>
                            </div>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                              <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors text-gray-800 font-black">-</button>
                              <span className="font-black w-6 text-center text-gray-900">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors text-gray-800 font-black">+</button>
                            </div>
                            <button onClick={() => onRemove(item.id)} className="font-black text-orange-600 hover:text-orange-500">Видалити</button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {step === 'cart' && items.length > 0 && (
            <div className="border-t border-gray-200 py-6 px-4 sm:px-6 bg-gray-50">
              <div className="flex justify-between text-xl font-extrabold text-gray-900 mb-6">
                <p>Всього</p>
                <p>{total} ₴</p>
              </div>
              <button 
                onClick={handleNextStep}
                className="w-full flex items-center justify-center rounded-2xl border border-transparent px-6 py-4 text-base font-extrabold text-white shadow-sm transition-all bg-orange-500 hover:bg-orange-600 active:scale-95"
              >
                Оформити замовлення
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
