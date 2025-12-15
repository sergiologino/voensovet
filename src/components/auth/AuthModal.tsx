import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!fullName.trim()) {
          setError('Введите ФИО');
          setLoading(false);
          return;
        }
        await register(email, password, fullName);
      }
      onClose();
      // Сброс формы
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#737373] hover:text-[#262626] hover:bg-[#f5f5f5] rounded-lg transition-colors"
        >
          <XIcon size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#262626]">
            {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </h2>
          <p className="text-sm text-[#737373] mt-1">
            {mode === 'login'
              ? 'Войдите, чтобы получить доступ к личному кабинету'
              : 'Создайте аккаунт для доступа ко всем возможностям'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-[#404040] mb-2">
                ФИО
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#404040] mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#404040] mb-2">
              Пароль
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            {mode === 'register' && (
              <p className="text-xs text-[#737373] mt-1">
                Минимум 6 символов
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? 'Загрузка...'
              : mode === 'login'
              ? 'Войти'
              : 'Зарегистрироваться'}
          </Button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#737373]">
            {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-[#2c5f8d] hover:underline font-medium"
            >
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

