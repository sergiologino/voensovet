import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../ui/Alert';
import { XIcon, Phone, Mail } from 'lucide-react';
import InputMask from 'react-input-mask';

interface LoginProps {
  onClose?: () => void;
  onSwitchToRegister?: () => void;
}

export function Login({ onClose, onSwitchToRegister }: LoginProps) {
  const { login } = useAuth();
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('+7 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Простая капча - случайное число
  const [captchaValue] = useState(() => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    return { question: `${a} + ${b}`, answer: a + b };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Проверка капчи
    if (parseInt(captcha) !== captchaValue.answer) {
      setError('Неверный ответ на проверку');
      return;
    }

    const contact = contactType === 'phone' ? phone : email;
    if (!contact || !password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await login(contact, password, captcha);
      onClose?.();
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleYandexAuth = () => {
    // Используем относительный URL для проксирования через Nginx
    window.location.href = `/api/auth/yandex`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#737373] hover:text-[#404040]"
          >
            <XIcon size={24} />
          </button>
        )}

        <h2 className="text-2xl font-bold text-[#262626] mb-6">Вход</h2>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Выбор типа контакта */}
          <div>
            <label className="block text-sm font-medium text-[#404040] mb-2">
              Способ входа
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setContactType('phone');
                  setEmail('');
                  setPhone('+7 ');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  contactType === 'phone'
                    ? 'border-[#2c5f8d] bg-[#f0f4f8] text-[#2c5f8d]'
                    : 'border-[#d4d4d4] bg-white text-[#404040] hover:border-[#2c5f8d]'
                }`}
              >
                <Phone size={18} />
                Телефон
              </button>
              <button
                type="button"
                onClick={() => {
                  setContactType('email');
                  setPhone('+7 ');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  contactType === 'email'
                    ? 'border-[#2c5f8d] bg-[#f0f4f8] text-[#2c5f8d]'
                    : 'border-[#d4d4d4] bg-white text-[#404040] hover:border-[#2c5f8d]'
                }`}
              >
                <Mail size={18} />
                Email
              </button>
            </div>
          </div>

          {/* Поле телефона или email */}
          {contactType === 'phone' ? (
            <div>
              <label className="block text-sm font-medium text-[#404040] mb-2">
                Номер телефона
              </label>
              <InputMask
                mask="+7 (999) 999-99-99"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                alwaysShowMask={false}
              >
                {(inputProps: any) => (
                  <input
                    {...inputProps}
                    type="tel"
                    className="w-full px-4 py-3 bg-white border-2 border-[#d4d4d4] rounded-xl text-[#262626] focus:outline-none focus:border-[#2c5f8d] focus:ring-2 focus:ring-[#2c5f8d] focus:ring-opacity-20 transition-colors"
                    placeholder="+7 (999) 123-45-67"
                    required
                  />
                )}
              </InputMask>
            </div>
          ) : (
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.ru"
              required
            />
          )}

          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#404040] mb-2">
              Проверка: {captchaValue.question} = ?
            </label>
            <Input
              type="number"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="Введите ответ"
              required
            />
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#737373]">или</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleYandexAuth}
          >
            Войти через Yandex
          </Button>
        </div>

        {onSwitchToRegister && (
          <p className="mt-4 text-center text-sm text-[#737373]">
            Нет аккаунта?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-[#2c5f8d] hover:underline"
            >
              Зарегистрироваться
            </button>
          </p>
        )}
      </div>
    </div>
  );
}



