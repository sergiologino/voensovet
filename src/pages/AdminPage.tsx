import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { api } from '../api/client';
import { SEO } from '../components/seo/SEO';
import { Settings, Users, BarChart3 } from 'lucide-react';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'stats' | 'users' | 'ai-requests'>('settings');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings
  const [primaryPrompt, setPrimaryPrompt] = useState('');
  const [secondaryPrompt, setSecondaryPrompt] = useState('');

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // AI Requests
  const [aiRequests, setAiRequests] = useState<any[]>([]);
  const [loadingAiRequests, setLoadingAiRequests] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    } else if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'ai-requests') {
      loadAiRequests();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      const data = await api.getAdminSettings();
      setPrimaryPrompt(data.settings.primary_prompt?.value || '');
      setSecondaryPrompt(data.settings.secondary_prompt?.value || '');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.getUsers();
      setUsers(data.users);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAiRequests = async () => {
    setLoadingAiRequests(true);
    try {
      const data = await api.getAiRequests();
      setAiRequests(data.requests);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAiRequests(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.updateAdminSettings(primaryPrompt, secondaryPrompt);
      setMessage({ type: 'success', text: 'Настройки сохранены' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Панель администратора"
        description="Административная панель портала поддержки военнослужащих."
        canonical="https://sergiologino-voensovet-1e9f.twc1.net#admin"
        noindex={true}
      />
      <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[#262626] mb-8">Панель администратора</h1>

        {/* Tabs */}
        <div className="border-b-2 border-[#e5e5e5] mb-8">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-[#2c5f8d] border-b-2 border-[#2c5f8d]'
                  : 'text-[#737373] hover:text-[#404040]'
              }`}
            >
              <Settings size={18} className="inline mr-2" />
              Настройки AI
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-[#2c5f8d] border-b-2 border-[#2c5f8d]'
                  : 'text-[#737373] hover:text-[#404040]'
              }`}
            >
              <BarChart3 size={18} className="inline mr-2" />
              Статистика
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-[#2c5f8d] border-b-2 border-[#2c5f8d]'
                  : 'text-[#737373] hover:text-[#404040]'
              }`}
            >
              <Users size={18} className="inline mr-2" />
              Пользователи
            </button>
            <button
              onClick={() => setActiveTab('ai-requests')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'ai-requests'
                  ? 'text-[#2c5f8d] border-b-2 border-[#2c5f8d]'
                  : 'text-[#737373] hover:text-[#404040]'
              }`}
            >
              AI Запросы
            </button>
          </div>
        </div>

        {message && (
          <Alert variant={message.type} className="mb-6">
            {message.text}
          </Alert>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#262626] mb-4">Настройки промптов для AI</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#404040] mb-2">
                  Первичный промпт (для анализа запроса)
                </label>
                <textarea
                  value={primaryPrompt}
                  onChange={(e) => setPrimaryPrompt(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-white border-2 border-[#d4d4d4] rounded-xl text-[#262626] focus:outline-none focus:border-[#2c5f8d] focus:ring-2 focus:ring-[#2c5f8d] focus:ring-opacity-20"
                  placeholder="Введите промпт для первичного анализа запроса пользователя..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#404040] mb-2">
                  Вторичный промпт (для финального ответа)
                </label>
                <textarea
                  value={secondaryPrompt}
                  onChange={(e) => setSecondaryPrompt(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-white border-2 border-[#d4d4d4] rounded-xl text-[#262626] focus:outline-none focus:border-[#2c5f8d] focus:ring-2 focus:ring-[#2c5f8d] focus:ring-opacity-20"
                  placeholder="Введите промпт для генерации финального ответа на основе анализа..."
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить настройки'}
              </Button>
            </form>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
              <div className="text-sm text-[#737373] mb-2">Всего пользователей</div>
              <div className="text-3xl font-bold text-[#262626]">{stats.totalUsers}</div>
            </div>
            <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
              <div className="text-sm text-[#737373] mb-2">Активных пользователей</div>
              <div className="text-3xl font-bold text-[#262626]">{stats.activeUsers}</div>
            </div>
            <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
              <div className="text-sm text-[#737373] mb-2">Всего запросов</div>
              <div className="text-3xl font-bold text-[#262626]">{stats.totalRequests}</div>
            </div>
            <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
              <div className="text-sm text-[#737373] mb-2">AI запросов</div>
              <div className="text-3xl font-bold text-[#262626]">{stats.totalAiRequests}</div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#262626] mb-4">Пользователи</h2>
            {loadingUsers ? (
              <p className="text-[#737373]">Загрузка...</p>
            ) : users.length === 0 ? (
              <p className="text-[#737373]">Пользователей нет</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border-2 border-[#e5e5e5] rounded-xl"
                  >
                    <div className="font-medium text-[#262626]">
                      {user.full_name || 'Без имени'} {user.is_admin && <span className="text-[#2c5f8d]">(Админ)</span>}
                    </div>
                    <div className="text-sm text-[#737373] mt-1">
                      {user.phone && <span>Телефон: {user.phone}</span>}
                      {user.email && <span className="ml-4">Email: {user.email}</span>}
                    </div>
                    <div className="text-xs text-[#a3a3a3] mt-2">
                      Регистрация: {new Date(user.created_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Requests Tab */}
        {activeTab === 'ai-requests' && (
          <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#262626] mb-4">AI Запросы</h2>
            {loadingAiRequests ? (
              <p className="text-[#737373]">Загрузка...</p>
            ) : aiRequests.length === 0 ? (
              <p className="text-[#737373]">Запросов нет</p>
            ) : (
              <div className="space-y-4">
                {aiRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 border-2 border-[#e5e5e5] rounded-xl"
                  >
                    <div className="font-medium text-[#262626] mb-2">
                      {req.full_name || req.phone || req.email || 'Пользователь'}
                    </div>
                    <div className="text-sm text-[#737373] mb-2">
                      <strong>Запрос:</strong> {req.primary_prompt}
                    </div>
                    <div className="text-sm text-[#737373] mb-2">
                      <strong>Ответ:</strong> {req.secondary_response?.substring(0, 200)}...
                    </div>
                    <div className="text-xs text-[#a3a3a3] mt-2">
                      {new Date(req.created_at).toLocaleString('ru-RU')} | 
                      Сеть: {req.network_used} | 
                      Токены: {req.tokens_used} | 
                      Время: {req.execution_time_ms}ms
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
    </>
  );
}

