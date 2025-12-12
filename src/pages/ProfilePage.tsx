import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { SEO } from '../components/seo/SEO';
import { MarkdownRenderer } from '../components/ai/MarkdownRenderer';
import { UserIcon, History, Settings, Bot, Copy, Download, Check } from 'lucide-react';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
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
      const html2canvas = (await import('html2canvas')).default;
      
      const requestsToExport = requestIds 
        ? aiRequests.filter(r => requestIds.includes(r.id))
        : aiRequests;

      if (requestsToExport.length === 0) {
        setMessage({ type: 'error', text: 'Нет запросов для экспорта' });
        return;
      }

      setMessage({ type: 'success', text: 'Генерация PDF... Это может занять некоторое время.' });

      // Создаем временный контейнер для рендеринга
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4 width
      container.style.padding = '20mm';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.color = '#262626';
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);

      // Создаем HTML контент для каждого запроса
      let htmlContent = `
        <div style="margin-bottom: 30px;">
          <div style="font-size: 18px; font-weight: bold; color: #2c5f8d; margin-bottom: 10px;">
            Портал Поддержки Военнослужащих
          </div>
          <div style="font-size: 10px; color: #737373; margin-bottom: 20px;">
            https://sergiologino-voensovet-1e9f.twc1.net | Экспорт от ${new Date().toLocaleDateString('ru-RU')}
          </div>
      `;

      requestsToExport.forEach((req, index) => {
        const question = req.primary_prompt || 'Нет вопроса';
        const fullAnswer = req.secondary_response || 'Нет ответа';
        const date = new Date(req.created_at).toLocaleString('ru-RU');
        const requestTitle = question.length > 50 ? question.substring(0, 50) + '...' : question;

        htmlContent += `
          <div style="margin-bottom: 40px; page-break-inside: avoid;">
            <div style="font-size: 14px; font-weight: bold; color: #262626; margin-bottom: 5px;">
              Запрос #${req.id}
            </div>
            <div style="font-size: 9px; color: #a3a3a3; margin-bottom: 15px;">
              Дата: ${date}${req.network_used ? ` | Сеть: ${req.network_used}` : ''}
            </div>
            
            <div style="margin-bottom: 15px;">
              <div style="font-size: 11px; font-weight: bold; color: #404040; margin-bottom: 5px;">Вопрос:</div>
              <div style="font-size: 10px; color: #404040; background: #fafafa; padding: 10px; border: 1px solid #e5e5e5; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word;">
                ${question.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '')}
              </div>
            </div>
            
            <div>
              <div style="font-size: 11px; font-weight: bold; color: #404040; margin-bottom: 5px;">Ответ:</div>
              <div style="font-size: 10px; color: #404040; background: #f0f4f8; padding: 10px; border: 1px solid #2c5f8d; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word;">
                ${fullAnswer.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')}
              </div>
            </div>
          </div>
        `;

        if (index < requestsToExport.length - 1) {
          htmlContent += '<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />';
        }
      });

      htmlContent += '</div>';
      container.innerHTML = htmlContent;

      // Рендерим HTML в canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Удаляем временный контейнер
      document.body.removeChild(container);

      // Создаем PDF
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const pageHeight = doc.internal.pageSize.height;
      let heightLeft = imgHeight;
      let position = 0;

      // Добавляем первую страницу
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Добавляем дополнительные страницы если нужно
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Добавляем колонтитулы на все страницы через canvas
      const totalPages = doc.internal.pages.length - 1;
      const req = requestsToExport[0];
      const requestTitle = req ? (req.primary_prompt || 'Нет вопроса').substring(0, 60) : '';
      
      // Создаем колонтитулы как изображения
      const headerContainer = document.createElement('div');
      headerContainer.style.position = 'absolute';
      headerContainer.style.left = '-9999px';
      headerContainer.style.width = '210mm';
      headerContainer.style.padding = '0 20mm';
      headerContainer.style.fontFamily = 'Arial, sans-serif';
      headerContainer.style.fontSize = '10px';
      headerContainer.style.color = '#737373';
      headerContainer.style.backgroundColor = 'transparent';
      headerContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0;">
          <span>Портал Поддержки Военнослужащих</span>
          <span>https://sergiologino-voensovet-1e9f.twc1.net</span>
        </div>
      `;
      document.body.appendChild(headerContainer);
      const headerCanvas = await html2canvas(headerContainer, { scale: 2, useCORS: true, logging: false, backgroundColor: null });
      document.body.removeChild(headerContainer);
      
      const footerContainer = document.createElement('div');
      footerContainer.style.position = 'absolute';
      footerContainer.style.left = '-9999px';
      footerContainer.style.width = '210mm';
      footerContainer.style.padding = '0 20mm';
      footerContainer.style.fontFamily = 'Arial, sans-serif';
      footerContainer.style.fontSize = '9px';
      footerContainer.style.color = '#737373';
      footerContainer.style.backgroundColor = 'transparent';
      footerContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0;">
          <span>${requestTitle ? `Тема: ${requestTitle}` : ''}</span>
          <span>Страница 1 из ${totalPages}</span>
        </div>
      `;
      document.body.appendChild(footerContainer);
      const footerCanvas = await html2canvas(footerContainer, { scale: 2, useCORS: true, logging: false, backgroundColor: null });
      document.body.removeChild(footerContainer);
      
      // Добавляем колонтитулы на все страницы
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Обновляем номер страницы в footer
        if (i > 1) {
          const footerContainer2 = document.createElement('div');
          footerContainer2.style.position = 'absolute';
          footerContainer2.style.left = '-9999px';
          footerContainer2.style.width = '210mm';
          footerContainer2.style.padding = '0 20mm';
          footerContainer2.style.fontFamily = 'Arial, sans-serif';
          footerContainer2.style.fontSize = '9px';
          footerContainer2.style.color = '#737373';
          footerContainer2.style.backgroundColor = 'transparent';
          footerContainer2.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0;">
              <span>${requestTitle ? `Тема: ${requestTitle}` : ''}</span>
              <span>Страница ${i} из ${totalPages}</span>
            </div>
          `;
          document.body.appendChild(footerContainer2);
          const footerCanvas2 = await html2canvas(footerContainer2, { scale: 2, useCORS: true, logging: false, backgroundColor: null });
          document.body.removeChild(footerContainer2);
          
          const footerImgWidth = 190;
          const footerImgHeight = (footerCanvas2.height * footerImgWidth) / footerCanvas2.width;
          doc.addImage(footerCanvas2.toDataURL('image/png'), 'PNG', 20, pageHeight - footerImgHeight - 5, footerImgWidth, footerImgHeight);
        } else {
          const footerImgWidth = 190;
          const footerImgHeight = (footerCanvas.height * footerImgWidth) / footerCanvas.width;
          doc.addImage(footerCanvas.toDataURL('image/png'), 'PNG', 20, pageHeight - footerImgHeight - 5, footerImgWidth, footerImgHeight);
        }
        
        // Верхний колонтитул
        const headerImgWidth = 190;
        const headerImgHeight = (headerCanvas.height * headerImgWidth) / headerCanvas.width;
        doc.addImage(headerCanvas.toDataURL('image/png'), 'PNG', 20, 5, headerImgWidth, headerImgHeight);
      }


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
              AI запросы
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

        {/* AI History Tab */}
        {activeTab === 'ai-history' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-[#262626]">История AI запросов</h2>
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

                      {/* Question */}
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-[#737373] mb-2">Вопрос:</div>
                        <div className="text-[#404040] bg-[#fafafa] border border-[#e5e5e5] rounded-lg p-3">
                          {req.primary_prompt || 'Нет вопроса'}
                        </div>
                      </div>

                      {/* Answer */}
                      <div>
                        <div className="text-sm font-semibold text-[#737373] mb-2">Ответ:</div>
                        <div className="text-[#404040] bg-[#f0f4f8] border border-[#2c5f8d] rounded-lg p-4">
                          {req.secondary_response ? (
                            <MarkdownRenderer content={req.secondary_response} />
                          ) : (
                            <span className="text-[#a3a3a3]">Нет ответа</span>
                          )}
                        </div>
                      </div>
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

