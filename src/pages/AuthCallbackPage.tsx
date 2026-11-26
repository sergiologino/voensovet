import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { oauthTokenFromHash } from '../utils/hashRoute';

export function AuthCallbackPage() {
  const { refreshUser } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = oauthTokenFromHash(window.location.hash);

    if (token) {
      localStorage.setItem('token', token);
      refreshUser().then(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        if (localStorage.getItem('token')) window.location.hash = '#profile';
        else setError(true);
      });
    } else {
      window.history.replaceState({}, document.title, window.location.pathname);
      setError(true);
    }
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#262626] mb-4">{error ? 'Не удалось войти через Яндекс' : 'Авторизация...'}</h2>
        <p className="text-[#737373]">{error ? 'Попробуйте ещё раз или войдите по телефону или почте.' : 'Пожалуйста, подождите'}</p>
        {error && <a href="#home" className="mt-5 inline-block font-semibold text-[#2c5f8d] underline">Вернуться на главную</a>}
      </div>
    </div>
  );
}



