import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../ui/Alert';
import { XIcon, Phone, Mail } from 'lucide-react';
import InputMask from 'react-input-mask';

interface RegisterProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

export function Register({ onClose, onSwitchToLogin }: RegisterProps) {
  const { register } = useAuth();
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('+7 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Простая капча - случайное число
  const [captchaValue] = useState(() => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    return { question: `${a} + ${b}`, answer: a + b };
  });

  const validatePhone = (phoneValue: string): boolean => {
    const cleaned = phoneValue.replace(/\D/g, '');
    return cleaned.length === 11 && cleaned.startsWith('7');
  };

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация контакта
    if (contactType === 'phone') {
      if (!validatePhone(phone)) {
        setError('Введите корректный номер телефона в формате +7 (999) 123-45-67');
        return;
      }
    } else {
      if (!validateEmail(email)) {
        setError('Введите корректный email адрес');
        return;
      }
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    // Проверка капчи
    if (parseInt(captcha) !== captchaValue.answer) {
      setError('Неверный ответ на проверку');
      return;
    }

    if (!password) {
      setError('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      const contact = contactType === 'phone' ? phone : email;
      await register(contact, password, fullName || undefined, captcha);
      onClose?.();
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleYandexAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/yandex`;
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

        <h2 className="text-2xl font-bold text-[#262626] mb-6">Регистрация</h2>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Выбор типа контакта */}
          <div>
            <label className="block text-sm font-medium text-[#404040] mb-2">
              Способ связи <span className="text-red-500">*</span>
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
                Номер телефона <span className="text-red-500">*</span>
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
            label="ФИО (необязательно)"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Иванов Иван Иванович"
          />

          <div>
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
            <p className="mt-1 text-xs text-[#737373]">
              Требования к паролю: минимум 6 символов, рекомендуется использовать буквы, цифры и специальные символы
            </p>
          </div>

          <Input
            label="Подтвердите пароль"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите пароль"
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
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

        {onSwitchToLogin && (
          <p className="mt-4 text-center text-sm text-[#737373]">
            Уже есть аккаунт?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#2c5f8d] hover:underline"
            >
              Войти
            </button>
          </p>
        )}
      </div>
    </div>
  );
}



