import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { oauthTokenFromHash } from '../utils/hashRoute';
import { Login } from '../components/auth/Login';

export function AuthCallbackPage() {
  const { refreshUser } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState('oauth_failed');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = oauthTokenFromHash(window.location.hash);

    if (token) {
      localStorage.setItem('token', token);
      refreshUser().then(() => {
        if (localStorage.getItem('token')) window.location.hash = '#profile';
        else {
          window.history.replaceState({}, document.title, `${window.location.pathname}#auth-callback?error=session_failed`);
          setError(true);
        }
      });
    } else {
      setErrorCode(new URLSearchParams(window.location.hash.split('?')[1] || '').get('error') || 'oauth_failed');
      setError(true);
    }
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#262626] mb-4">{error ? 'Не удалось войти через Яндекс' : 'Авторизация...'}</h2>
        <p className="text-[#737373]">{errorCode === 'email_in_use'
          ? 'Этот адрес уже зарегистрирован. Войдите по почте и привяжите Яндекс в личном кабинете.'
          : errorCode === 'link_failed'
            ? 'Не удалось привязать Яндекс. Вернитесь в личный кабинет и попробуйте ещё раз.'
            : error ? 'Попробуйте ещё раз или войдите по телефону или почте.' : 'Пожалуйста, подождите'}</p>
        {error && (errorCode === 'email_in_use'
          ? <button type="button" onClick={() => setShowLogin(true)} className="mt-5 font-semibold text-[#2c5f8d] underline">Войти по почте</button>
          : <a href={errorCode === 'link_failed' ? '#profile' : '#home'} className="mt-5 inline-block font-semibold text-[#2c5f8d] underline">{errorCode === 'link_failed' ? 'В личный кабинет' : 'Вернуться на главную'}</a>)}
      </div>
      {showLogin && <Login initialContactType="email" onClose={() => setShowLogin(false)} onSuccess={() => { window.location.hash = '#profile'; }} />}
    </div>
  );
}



