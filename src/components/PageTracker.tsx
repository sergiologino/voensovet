import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export function PageTracker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const trackPage = async () => {
      try {
        await api.trackPageVisit(
          window.location.href,
          document.title
        );
      } catch (error) {
        // Игнорируем ошибки трекинга
        console.debug('Page tracking error:', error);
      }
    };

    // Трекинг при загрузке страницы
    trackPage();

    // Трекинг при изменении hash (навигация)
    const handleHashChange = () => {
      setTimeout(trackPage, 100);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [user]);

  return null;
}

