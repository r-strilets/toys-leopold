
import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === '1' && password === '1') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 animate-in fade-in zoom-in duration-300 px-4">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-yellow-200 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Вхід в адмінку</h2>
        <p className="text-gray-700 text-sm mb-8 text-center font-medium">Будь ласка, введіть ваші дані</p>
        
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-1.5 ml-1 tracking-wider">Логін</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введіть логін..."
              className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none transition-all font-bold text-gray-900 placeholder-gray-500 ${
                error ? 'border-red-500 bg-red-50 animate-shake' : 'border-gray-200 focus:border-yellow-400 bg-gray-50'
              }`}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-1.5 ml-1 tracking-wider">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введіть пароль..."
              className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none transition-all font-bold text-gray-900 placeholder-gray-500 ${
                error ? 'border-red-500 bg-red-50 animate-shake' : 'border-gray-200 focus:border-yellow-400 bg-gray-50'
              }`}
            />
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-xl text-center border border-red-200 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold">Невірний логін або пароль!</p>
            </div>
          )}
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black transition-all shadow-lg hover:shadow-orange-200 active:scale-95 text-lg"
            >
              Увійти
            </button>
          </div>
          
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-gray-600 text-sm font-bold hover:text-gray-900 transition-colors py-2"
          >
            Повернутися
          </button>
        </form>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
