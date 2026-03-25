import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Функция для конвертации markdown в HTML элементы
  const renderMarkdown = (text: string): React.ReactNode[] => {
    if (!text) return [];

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, index) => {
      // Обработка code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Закрываем code block
          elements.push(
            <pre key={`code-${index}`} className="bg-[#f5f5f5] border border-[#d4d4d4] rounded-lg p-4 my-3 overflow-x-auto">
              <code className="text-sm text-[#262626] font-mono">
                {codeBlockContent.join('\n')}
              </code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Открываем code block
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Завершаем текущий список если нужно
      if (currentList.length > 0 && !line.trim().match(/^[-*•]\s|^\d+[\.\)]\s/)) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 my-2 ml-4">
            {currentList.map((item, i) => (
              <li key={i} className="text-[#404040]">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
      }

      const trimmed = line.trim();

      // Заголовки
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-[#262626] mt-4 mb-2">
            {trimmed.substring(4)}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-bold text-[#262626] mt-5 mb-3">
            {trimmed.substring(3)}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-[#262626] mt-6 mb-4">
            {trimmed.substring(2)}
          </h1>
        );
        return;
      }

      // Списки
      const listMatch = trimmed.match(/^[-*•]\s(.+)/);
      if (listMatch) {
        currentList.push(processInlineMarkdown(listMatch[1]));
        return;
      }

      const numberedListMatch = trimmed.match(/^\d+[\.\)]\s(.+)/);
      if (numberedListMatch) {
        elements.push(
          <div key={index} className="flex gap-2 my-1">
            <span className="text-[#2c5f8d] font-semibold flex-shrink-0">
              {trimmed.match(/^\d+/)?.[0]}.
            </span>
            <span className="text-[#404040] flex-1">
              {processInlineMarkdown(numberedListMatch[1])}
            </span>
          </div>
        );
        return;
      }

      // Горизонтальная линия
      if (trimmed.match(/^[-*_]{3,}$/)) {
        elements.push(<hr key={index} className="my-4 border-[#e5e5e5]" />);
        return;
      }

      // Пустая строка
      if (trimmed === '') {
        if (elements.length > 0 && elements[elements.length - 1]?.type !== 'br') {
          elements.push(<br key={`br-${index}`} />);
        }
        return;
      }

      // Обычный параграф
      elements.push(
        <p key={index} className="text-[#404040] leading-relaxed my-2">
          {processInlineMarkdown(trimmed)}
        </p>
      );
    });

    // Завершаем последний список если есть
    if (currentList.length > 0) {
      elements.push(
        <ul key="list-final" className="list-disc list-inside space-y-1 my-2 ml-4">
          {currentList.map((item, i) => (
            <li key={i} className="text-[#404040]">{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  // Обработка inline markdown (жирный, курсив, ссылки)
  const processInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return text;

    const parts: React.ReactNode[] = [];
    let keyCounter = 0;

    // Разбиваем текст на части, обрабатывая каждый паттерн по очереди
    let remaining = text;
    const processed: Array<{ type: 'text' | 'element'; content: React.ReactNode; start: number; end: number }> = [];

    // Сначала обрабатываем ссылки в формате [текст](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(text)) !== null) {
      processed.push({
        type: 'element',
        content: (
          <a 
            key={`link-${keyCounter++}`}
            href={linkMatch[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#2c5f8d] hover:underline font-medium"
          >
            {linkMatch[1]}
          </a>
        ),
        start: linkMatch.index,
        end: linkMatch.index + linkMatch[0].length
      });
    }

    // Затем обрабатываем URL
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    let urlMatch;
    while ((urlMatch = urlRegex.exec(text)) !== null) {
      // Проверяем, не перекрывается ли с уже обработанной ссылкой
      const overlaps = processed.some(p => 
        p.start <= urlMatch.index && urlMatch.index < p.end
      );
      if (!overlaps) {
        processed.push({
          type: 'element',
          content: (
            <a 
              key={`url-${keyCounter++}`}
              href={urlMatch[1]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2c5f8d] hover:underline break-all"
            >
              {urlMatch[1]}
            </a>
          ),
          start: urlMatch.index,
          end: urlMatch.index + urlMatch[0].length
        });
      }
    }

    // Телефоны (разные форматы)
    const phoneRegex = /(\+?7|8)[\s-]?\(?(\d{3})\)?[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})/g;
    let phoneMatch;
    while ((phoneMatch = phoneRegex.exec(text)) !== null) {
      const overlaps = processed.some(p => 
        p.start <= phoneMatch.index && phoneMatch.index < p.end
      );
      if (!overlaps) {
        const phoneNumber = phoneMatch[0];
        const cleanPhone = phoneNumber.replace(/\s|-|\(|\)/g, '');
        processed.push({
          type: 'element',
          content: (
            <a 
              key={`phone-${keyCounter++}`}
              href={`tel:${cleanPhone}`}
              className="text-[#2c5f8d] hover:underline font-medium"
            >
              {phoneNumber}
            </a>
          ),
          start: phoneMatch.index,
          end: phoneMatch.index + phoneMatch[0].length
        });
      }
    }

    // Жирный текст **текст**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let boldMatch;
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      const overlaps = processed.some(p => 
        p.start <= boldMatch.index && boldMatch.index < p.end
      );
      if (!overlaps) {
        processed.push({
          type: 'element',
          content: (
            <strong key={`bold-${keyCounter++}`} className="font-semibold text-[#262626]">
              {boldMatch[1]}
            </strong>
          ),
          start: boldMatch.index,
          end: boldMatch.index + boldMatch[0].length
        });
      }
    }

    // Курсив *текст*
    const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
    let italicMatch;
    while ((italicMatch = italicRegex.exec(text)) !== null) {
      const overlaps = processed.some(p => 
        p.start <= italicMatch.index && italicMatch.index < p.end
      );
      if (!overlaps) {
        processed.push({
          type: 'element',
          content: (
            <em key={`italic-${keyCounter++}`} className="italic">
              {italicMatch[1]}
            </em>
          ),
          start: italicMatch.index,
          end: italicMatch.index + italicMatch[0].length
        });
      }
    }

    // Inline код `код`
    const codeRegex = /`([^`]+)`/g;
    let codeMatch;
    while ((codeMatch = codeRegex.exec(text)) !== null) {
      const overlaps = processed.some(p => 
        p.start <= codeMatch.index && codeMatch.index < p.end
      );
      if (!overlaps) {
        processed.push({
          type: 'element',
          content: (
            <code key={`code-${keyCounter++}`} className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-sm font-mono text-[#2c5f8d]">
              {codeMatch[1]}
            </code>
          ),
          start: codeMatch.index,
          end: codeMatch.index + codeMatch[0].length
        });
      }
    }

    // Сортируем по позиции
    processed.sort((a, b) => a.start - b.start);

    // Убираем перекрывающиеся элементы (оставляем первые)
    const filtered: typeof processed = [];
    processed.forEach(item => {
      const hasOverlap = filtered.some(f => 
        (item.start >= f.start && item.start < f.end) ||
        (item.end > f.start && item.end <= f.end) ||
        (item.start <= f.start && item.end >= f.end)
      );
      if (!hasOverlap) {
        filtered.push(item);
      }
    });

    // Собираем результат
    let lastIndex = 0;
    filtered.forEach(item => {
      // Добавляем текст до элемента
      if (item.start > lastIndex) {
        parts.push(text.substring(lastIndex, item.start));
      }
      // Добавляем элемент
      parts.push(item.content);
      lastIndex = item.end;
    });

    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  return (
    <div className={`markdown-content ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
}

