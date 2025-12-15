// ProfilePage - User profile with AI requests history
// Features: PDF export with Cyrillic font, accordion UI, clipboard copy
import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { useRegionContext } from '../context/RegionContext';
import { api } from '../api/client';
import { SEO } from '../components/seo/SEO';
import { MarkdownRenderer } from '../components/ai/MarkdownRenderer';
import arialFont from '../utils/fonts/arial-normal';
import { UserIcon, History, Settings, Bot, Copy, Download, Check, ChevronDown, ChevronRight, MapPin } from 'lucide-react';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { region, openSelector } = useRegionContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'ai-history'>('profile');
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

  // AI History
  const [aiRequests, setAiRequests] = useState<any[]>([]);
  const [loadingAiHistory, setLoadingAiHistory] = useState(false);
  const [selectedAiRequests, setSelectedAiRequests] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [openedRequestId, setOpenedRequestId] = useState<number | null>(null); // Для аккордеона


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
    } else if (activeTab === 'ai-history') {
      loadAiHistory();
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

  const loadAiHistory = async () => {
    setLoadingAiHistory(true);
    try {
      const data = await api.getAiHistory(100, 0);
      setAiRequests(data.requests);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAiHistory(false);
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const exportToPDF = async (requestIds?: number[]) => {

    try {
      const { jsPDF } = await import('jspdf');
      
      const requestsToExport = requestIds 
        ? aiRequests.filter(r => requestIds.includes(r.id))
        : aiRequests;

      if (requestsToExport.length === 0) {
        setMessage({ type: 'error', text: 'Нет запросов для экспорта' });
        return;
      }

      setMessage({ type: 'success', text: 'Генерация PDF...' });

      // Создаем PDF с кириллическим шрифтом
      const doc = new jsPDF('p', 'mm', 'a4');
      // Добавляем кириллический шрифт
      // Файл шрифта экспортирует переменную font (base64 строка)
      doc.addFileToVFS('arial-normal.ttf', arialFont);
      doc.addFont('arial-normal.ttf', 'arial', 'normal');
      doc.setFont('arial', 'normal'); // Явно указываем стиль

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const headerHeight = 15; // Высота верхнего колонтитула
      const footerHeight = 15; // Высота нижнего колонтитула
      const contentStartY = margin + headerHeight + 5; // Начало контента с учетом колонтитула + отступ
      const contentEndY = pageHeight - margin - footerHeight - 5; // Конец контента с учетом колонтитула + отступ
      const maxWidth = pageWidth - 2 * margin;
      const lineHeight = 6;
      
      let yPosition = contentStartY;
      let currentPage = 1;
      const totalRequests = requestsToExport.length;
      const req = requestsToExport[0];
      const requestTitle = req ? (req.primary_prompt || 'Нет вопроса').substring(0, 60) : '';

      // Функция для рисования красной звезды
      const drawStar = (x: number, y: number, size: number) => {
        const outerRadius = size / 2;
        const innerRadius = outerRadius * 0.4;
        const points = 5;
        const angle = Math.PI / points;
        
        doc.setFillColor(220, 38, 38); // Красный цвет #dc2626
        doc.setDrawColor(153, 27, 27); // Темно-красный для обводки #991b1b
        doc.setLineWidth(0.3);
        
        let path = '';
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const currentAngle = i * angle - Math.PI / 2;
          const px = x + radius * Math.cos(currentAngle);
          const py = y + radius * Math.sin(currentAngle);
          
          if (i === 0) {
            path = `M ${px} ${py}`;
          } else {
            path += ` L ${px} ${py}`;
          }
        }
        path += ' Z';
        
        doc.path(path, 'FD'); // Fill and Draw
      };

      // Функция для добавления колонтитулов (используем текстовый метод, так как шрифт поддерживает кириллицу)
      const addHeaderFooter = (pageNum: number) => {
        doc.setPage(pageNum);
        
        // ВАЖНО: После setPage() нужно заново установить шрифт
        doc.setFont('arial', 'normal');
        
        // Верхний колонтитул
        // Рисуем красную звезду слева от названия
        const starSize = 4; // Размер звезды в мм
        const starX = margin;
        const starY = 10;
        drawStar(starX + starSize / 2, starY, starSize);
        
        // Название портала с отступом от звезды
        doc.setFontSize(10);
        doc.setTextColor(115, 115, 115);
        doc.text('Портал Поддержки Военнослужащих', margin + starSize + 2, 10);
        doc.text('https://sergiologino-voensovet-1e9f.twc1.net', pageWidth - margin, 10, { align: 'right' });
        
        // Нижний колонтитул
        doc.setFontSize(9);
        if (requestTitle) {
          doc.text(`Тема: ${requestTitle}`, margin, pageHeight - 5);
        }
        doc.text(`Страница ${pageNum}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
      };

      // Добавляем колонтитулы на первую страницу
      addHeaderFooter(currentPage);

      // Функция для добавления текста с поддержкой кириллицы
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        // Разбиваем текст на строки
        const lines = doc.splitTextToSize(text, maxWidth);
        let currentY = y;
        
        lines.forEach((line: string) => {
          // Проверяем, нужна ли новая страница
          if (currentY > contentEndY - lineHeight) {
            currentPage++;
            doc.addPage();
            addHeaderFooter(currentPage);
            currentY = contentStartY;
            // После добавления новой страницы нужно снова установить шрифт
            doc.setFont('arial', 'normal');
          }
          
          // Убеждаемся, что шрифт установлен перед выводом текста
          doc.setFont('arial', 'normal');
          // Используем метод text с кириллическим шрифтом
          doc.text(line, x, currentY, options);
          currentY += lineHeight;
        });
        
        return currentY;
      };

      requestsToExport.forEach((req, index) => {
        const question = req.primary_prompt || 'Нет вопроса';
        const fullAnswer = req.secondary_response || 'Нет ответа';
        const date = new Date(req.created_at).toLocaleString('ru-RU');
        
        // Проверяем, нужна ли новая страница перед новым запросом
        if (yPosition > contentEndY - 30 && index > 0) {
          currentPage++;
          doc.addPage();
          addHeaderFooter(currentPage);
          yPosition = contentStartY;
        }

        // Заголовок запроса
        doc.setFontSize(14);
        doc.setFont('arial', 'normal'); // Используем normal, так как bold может быть не зарегистрирован
        doc.setTextColor(38, 38, 38);
        yPosition = addText(`Запрос #${req.id}`, margin, yPosition);
        yPosition += 2;

        // Дата и метаданные
        doc.setFontSize(9);
        doc.setFont('arial', 'normal');
        doc.setTextColor(163, 163, 163);
        yPosition = addText(`Дата: ${date}${req.network_used ? ` | Сеть: ${req.network_used}` : ''}`, margin, yPosition);
        yPosition += 3;

        // Вопрос
        doc.setFontSize(11);
        doc.setFont('arial', 'normal'); // Используем normal, так как bold может быть не зарегистрирован
        doc.setTextColor(64, 64, 64);
        yPosition = addText('Вопрос:', margin, yPosition);
        
        doc.setFont('arial', 'normal');
        doc.setFontSize(10);
        const cleanQuestion = question.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
        yPosition = addText(cleanQuestion, margin, yPosition);
        yPosition += 4;

        // Ответ
        doc.setFont('arial', 'normal'); // Используем normal для всех стилей
        yPosition = addText('Ответ:', margin, yPosition);
        doc.setFont('arial', 'normal');
        
        const cleanAnswer = fullAnswer
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        yPosition = addText(cleanAnswer, margin, yPosition);

        // Разделитель между запросами
        if (index < totalRequests - 1) {
          yPosition += 8;
          if (yPosition > contentEndY - 10) {
            currentPage++;
            doc.addPage();
            addHeaderFooter(currentPage);
            yPosition = contentStartY;
          }
          doc.setDrawColor(229, 229, 229);
          doc.setLineWidth(0.5);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 12;
        }
      });


      const fileName = requestIds && requestIds.length === 1
        ? `ai-request-${requestIds[0]}.pdf`
        : `ai-requests-${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(fileName);
      setMessage({ type: 'success', text: `Экспортировано ${requestsToExport.length} запросов в PDF` });
    } catch (error: any) {
      console.error('PDF export error:', error);
      setMessage({ type: 'error', text: 'Ошибка при экспорте в PDF. Убедитесь, что библиотеки установлены: npm install jspdf' });
    }
  };

  const toggleSelectRequest = (id: number) => {
    const newSelected = new Set(selectedAiRequests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAiRequests(newSelected);
  };

  const selectAll = () => {
    if (selectedAiRequests.size === aiRequests.length) {
      setSelectedAiRequests(new Set());
    } else {
      setSelectedAiRequests(new Set(aiRequests.map(r => r.id)));
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
              История посещений
            </button>
            <button
              onClick={() => setActiveTab('ai-history')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'ai-history'
                  ? 'text-[#2c5f8d] border-b-2 border-[#2c5f8d]'
                  : 'text-[#737373] hover:text-[#404040]'
              }`}
            >
              <Bot size={18} className="inline mr-2" />
              Запросы Комбату
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
                
                {/* Region Selector */}
                <div>
                  <label className="block text-sm font-medium text-[#404040] mb-2">
                    Регион
                  </label>
                  <button
                    type="button"
                    onClick={openSelector}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm border-2 border-[#d4d4d4] rounded-lg bg-white text-[#404040] hover:border-[#2c5f8d] hover:bg-[#f0f4f8] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#2c5f8d]" />
                      <span>{region ? region.name : 'Выберите регион'}</span>
                    </div>
                    <ChevronDown size={16} className="text-[#737373]" />
                  </button>
                  <p className="text-xs text-[#737373] mt-1">
                    Укажите ваш регион для получения актуальной информации
                  </p>
                </div>

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

        {/* AI History Tab */}
        {activeTab === 'ai-history' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-[#262626]">История запросов к Комбату</h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                >
                  {selectedAiRequests.size === aiRequests.length ? 'Снять выбор' : 'Выбрать все'}
                </Button>
                {selectedAiRequests.size > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => exportToPDF(Array.from(selectedAiRequests))}
                  >
                    <Download size={16} className="mr-2" />
                    Экспорт выбранных ({selectedAiRequests.size})
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => exportToPDF()}
                  disabled={aiRequests.length === 0}
                >
                  <Download size={16} className="mr-2" />
                  Экспорт всех
                </Button>
              </div>
            </div>

            {/* Requests List */}
            {loadingAiHistory ? (
              <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
                <p className="text-[#737373]">Загрузка...</p>
              </div>
            ) : aiRequests.length === 0 ? (
              <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6">
                <p className="text-[#737373]">История AI запросов пуста</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiRequests.map((req) => {
                  const fullText = `Вопрос: ${req.primary_prompt || 'Нет вопроса'}\n\nОтвет: ${req.secondary_response || 'Нет ответа'}\n\nДата: ${new Date(req.created_at).toLocaleString('ru-RU')}`;
                  const isSelected = selectedAiRequests.has(req.id);
                  
                  return (
                    <div
                      key={req.id}
                      className={`bg-white border-2 rounded-2xl p-6 transition-colors ${
                        isSelected ? 'border-[#2c5f8d] bg-[#f0f4f8]' : 'border-[#e5e5e5] hover:border-[#2c5f8d]'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRequest(req.id)}
                            className="w-5 h-5 text-[#2c5f8d] border-2 border-[#d4d4d4] rounded focus:ring-2 focus:ring-[#2c5f8d]"
                          />
                          <div>
                            <div className="font-semibold text-[#262626]">
                              Запрос #{req.id}
                            </div>
                            <div className="text-xs text-[#a3a3a3] mt-1">
                              {new Date(req.created_at).toLocaleString('ru-RU')}
                              {req.network_used && ` • ${req.network_used}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(fullText, req.id)}
                            className="p-2 text-[#737373] hover:text-[#2c5f8d] hover:bg-[#f0f4f8] rounded-lg transition-colors"
                            title="Копировать"
                          >
                            {copiedId === req.id ? (
                              <Check size={18} className="text-[#16a34a]" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => exportToPDF([req.id])}
                            className="p-2 text-[#737373] hover:text-[#2c5f8d] hover:bg-[#f0f4f8] rounded-lg transition-colors"
                            title="Экспорт в PDF"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Question - кликабельный для аккордеона */}
                      <div className="mb-2">
                        <button
                          onClick={() => {
                            // Если кликнули на уже открытый вопрос - закрываем, иначе открываем новый
                            setOpenedRequestId(openedRequestId === req.id ? null : req.id);
                          }}
                          className="w-full text-left"
                        >
                          <div className="text-sm font-semibold text-[#737373] mb-2">Вопрос:</div>
                          <div className="text-[#404040] bg-[#fafafa] border border-[#e5e5e5] rounded-lg p-3 hover:bg-[#f0f0f0] transition-colors cursor-pointer flex items-center justify-between">
                            <span className="flex-1">{req.primary_prompt || 'Нет вопроса'}</span>
                            <span className="ml-2 text-[#2c5f8d]">
                              {openedRequestId === req.id ? (
                                <ChevronDown size={20} />
                              ) : (
                                <ChevronRight size={20} />
                              )}
                            </span>
                          </div>
                        </button>
                      </div>

                      {/* Answer - показывается только если запрос открыт */}
                      {openedRequestId === req.id && (
                        <div className="mt-3 animate-fadeIn">
                          <div className="text-sm font-semibold text-[#737373] mb-2">Ответ:</div>
                          <div className="text-[#404040] bg-[#f0f4f8] border border-[#2c5f8d] rounded-lg p-4">
                            {req.secondary_response ? (
                              <MarkdownRenderer content={req.secondary_response} />
                            ) : (
                              <span className="text-[#a3a3a3]">Нет ответа</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

