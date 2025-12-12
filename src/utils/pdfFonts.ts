// Утилита для работы с кириллическими шрифтами в jsPDF
// Для полной поддержки кириллицы нужно добавить шрифт через addFont
// Пока используем базовую поддержку через правильную настройку

export function setupCyrillicFont(doc: any) {
  // jsPDF 2.x поддерживает Unicode, но для кириллицы нужен правильный шрифт
  // Используем стандартные шрифты, которые частично поддерживают кириллицу
  // Для полной поддержки нужно добавить кастомный шрифт через addFont
  
  // Устанавливаем кодировку
  doc.setLanguage('ru');
  
  return doc;
}

// Функция для безопасного добавления текста с кириллицей
export function addCyrillicText(doc: any, text: string, x: number, y: number, options: any = {}) {
  try {
    // Пытаемся добавить текст напрямую
    // jsPDF 2.x должен поддерживать Unicode
    doc.text(text, x, y, options);
    return true;
  } catch (e) {
    // Если не получается, пробуем другой способ
    try {
      // Используем метод с явным указанием кодировки
      const lines = doc.splitTextToSize(text, options.maxWidth || doc.internal.pageSize.width - x * 2);
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, y + (index * (options.lineHeight || 6)));
      });
      return true;
    } catch (e2) {
      console.warn('Failed to add cyrillic text:', e2);
      return false;
    }
  }
}

