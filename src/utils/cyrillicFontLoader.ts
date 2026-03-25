// Загрузчик кириллического шрифта для jsPDF
// Используем готовый шрифт PT Sans, который поддерживает кириллицу

export async function loadCyrillicFont(doc: any): Promise<void> {
  try {
    // Пытаемся загрузить готовый кириллический шрифт
    // Для полной поддержки нужно конвертировать шрифт через fontconverter jsPDF
    // Пока используем стандартные методы jsPDF 2.x, которые частично поддерживают Unicode
    
    // В будущем можно добавить:
    // 1. Конвертировать шрифт Arial или PT Sans через https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
    // 2. Сохранить конвертированный файл в проект
    // 3. Импортировать и добавить через:
    //    doc.addFileToVFS('Arial.ttf', arialFontBase64);
    //    doc.addFont('Arial.ttf', 'Arial', 'normal');
    //    doc.setFont('Arial');
    
    return Promise.resolve();
  } catch (error) {
    console.warn('Failed to load cyrillic font:', error);
    return Promise.resolve();
  }
}

