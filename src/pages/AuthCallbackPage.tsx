import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function AuthCallbackPage() {
  const { refreshUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      refreshUser().then(() => {
        // Удаляем параметры из URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Перенаправляем на главную или профиль
        window.location.hash = '#profile';
      });
    } else {
      window.location.hash = '#';
    }
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#262626] mb-4">Авторизация...</h2>
        <p className="text-[#737373]">Пожалуйста, подождите</p>
      </div>
    </div>
  );
}

