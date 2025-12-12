import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { SEO } from '../components/seo/SEO';
import { UserIcon, History, Settings } from 'lucide-react';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // History
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);


  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getUserRequests();
      setRequests(data.requests);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.updateProfile({ fullName, email, phone });
      await refreshUser();
      setMessage({ type: 'success', text: 'Профиль обновлен' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      setLoading(false);
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Пароль изменен' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <SEO
        title="Личный кабинет"
        description="Личный кабинет пользователя портала поддержки военнослужащих: профиль, история запросов, настройки."
        canonical="https://sergiologino-voensovet-1e9f.twc1.net#profile"
        noindex={true}
      />
      <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[#262626] mb-8">Личный кабинет</h1>

        {/* Tabs */}
        <div className="border-b-2 border-[#e5e5e5] mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-[#2c5f8d] border-b-2 border-[#2c5f8d]'
                  : 'text-[#737373] hover:text-[#404040]'
              }`}
            >
              <Settings size={18} className="inline mr-2" />
              Профиль
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-[#2c5f8d] border-b-2 border-[#2c5f8d]'
                  : 'text-[#737373] hover:text-[#404040]'
              }`}
            >
              <History size={18} className="inline mr-2" />
              История запросов
            </button>
          </div>
        </div>

        {message && (
          <Alert variant={message.type} className="mb-6">
            {message.text}
          </Alert>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Profile Info */}
            <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[#262626] mb-4">Личные данные</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label="ФИО"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.ru"
                />
                <Input
                  label="Телефон"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[#262626] mb-4">Смена пароля</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Текущий пароль"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  label="Новый пароль"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Подтвердите новый пароль"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Изменение...' : 'Изменить пароль'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#262626] mb-4">История посещений</h2>
            {loadingHistory ? (
              <p className="text-[#737373]">Загрузка...</p>
            ) : requests.length === 0 ? (
              <p className="text-[#737373]">История пуста</p>
            ) : (
              <div className="space-y-2">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 border-2 border-[#e5e5e5] rounded-xl hover:border-[#2c5f8d] transition-colors"
                  >
                    <div className="font-medium text-[#262626]">{req.page_title || req.page_url}</div>
                    <div className="text-sm text-[#737373] mt-1">{req.page_url}</div>
                    <div className="text-xs text-[#a3a3a3] mt-2">
                      {new Date(req.created_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

