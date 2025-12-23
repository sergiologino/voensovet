import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useAuth } from '../../context/AuthContext';
import { useRegionContext } from '../../context/RegionContext';
import { api } from '../../api/client';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Bot, Send, ChevronDown, ChevronUp } from 'lucide-react';

export function AiAssistant() {
  const { user } = useAuth();
  const { region } = useRegionContext();
  const [query, setQuery] = useState('');
  const [shortAnswer, setShortAnswer] = useState<string | null>(null);
  const [detailedAnswer, setDetailedAnswer] = useState<string | null>(null);
  const [showDetailed, setShowDetailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exampleQueries = [
    'Какие льготы положены военнослужащим после увольнения?',
    'Как оформить пенсию по инвалидности?',
    'Какие документы нужны для получения жилищной субсидии?',
    'Куда обратиться за психологической помощью?'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Для использования AI помощника необходимо войти в систему');
      return;
    }

    if (!query.trim()) {
      setError('Введите ваш вопрос');
      return;
    }

    setLoading(true);
    setError(null);
    setShortAnswer(null);
    setDetailedAnswer(null);
    setShowDetailed(false);

    try {
      const regionName = region?.name || undefined;
      const response = await api.processAiRequest(query, regionName);
      setShortAnswer(response.shortAnswer);
      setDetailedAnswer(response.detailedAnswer);
      setQuery('');
    } catch (err: any) {
      setError(err.message || 'Ошибка при обработке запроса. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setError(null);
    setShortAnswer(null);
    setDetailedAnswer(null);
    setShowDetailed(false);
  };

  return (
    <section className="py-12 lg:py-16 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6 lg:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <img
                src="/voenkot_bot.png"
                alt="военкот"
                className="h-12 w-12 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold text-[#262626]">Нейропомощник Комбат</h2>
              <p className="text-sm text-[#737373]">Задайте вопрос и получите помощь</p>
            </div>
          </div>

          {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#404040] mb-2">
            Ваш вопрос
          </label>
          <textarea
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            rows={4}
            className="w-full px-4 py-3 bg-white border-2 border-[#d4d4d4] rounded-xl text-[#262626] focus:outline-none focus:border-[#2c5f8d] focus:ring-2 focus:ring-[#2c5f8d] focus:ring-opacity-20 transition-colors"
            placeholder="Например: Какие льготы положены военнослужащим после увольнения?"
            required
            disabled={loading || !user}
          />
        </div>

        {/* Примеры запросов */}
        <div>
          <p className="text-xs text-[#737373] mb-2">Примеры вопросов:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                disabled={loading || !user}
                className="px-3 py-1.5 text-xs bg-[#f0f4f8] text-[#2c5f8d] rounded-lg hover:bg-[#d9e6f2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading || !user} 
          fullWidth
          className="flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Обработка запроса...
            </>
          ) : (
            <>
              <Send size={18} />
              Отправить запрос
            </>
          )}
        </Button>

        {!user && (
          <p className="text-xs text-center text-[#737373]">
            <a href="#profile" className="text-[#2c5f8d] hover:underline">
              Войдите в систему
            </a>
            {' '}для использования Нейропомощника
          </p>
        )}
      </form>

      {/* Ответ AI */}
      {shortAnswer && (
        <div className="mt-6 space-y-4">
          {/* Краткий ответ */}
          <div className="p-4 bg-[#f0f4f8] border-2 border-[#2c5f8d] rounded-xl">
            <h3 className="font-semibold text-[#262626] mb-3 flex items-center gap-2">
              <Bot size={18} className="text-[#2c5f8d]" />
              Краткий ответ:
            </h3>
            <MarkdownRenderer content={shortAnswer} />
          </div>

          {/* Подробный ответ под спойлером */}
          {detailedAnswer && detailedAnswer !== shortAnswer && (
            <div className="border-2 border-[#e5e5e5] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowDetailed(!showDetailed)}
                className="w-full px-4 py-3 bg-[#f5f5f5] hover:bg-[#e5e5e5] transition-colors flex items-center justify-between text-left"
              >
                <span className="font-semibold text-[#262626]">
                  Подробный ответ с обоснованиями и ссылками
                </span>
                {showDetailed ? (
                  <ChevronUp size={20} className="text-[#737373]" />
                ) : (
                  <ChevronDown size={20} className="text-[#737373]" />
                )}
              </button>
              
              {showDetailed && (
                <div className="p-4 bg-white">
                  <MarkdownRenderer content={detailedAnswer} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </section>
  );
}

