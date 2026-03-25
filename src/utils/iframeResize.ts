// Утилита для автоматической отправки высоты родительскому окну (для iframe)
// Добавляется только если приложение загружено в iframe

export function initIframeResizer() {
  // Проверяем, находимся ли мы в iframe
  if (window.self === window.top) {
    return; // Не в iframe, ничего не делаем
  }

  const sendHeight = () => {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage(
      {
        type: 'resize-iframe',
        height: height,
      },
      '*' // В продакшене лучше указать конкретный домен site.pro
    );
  };

  // Отправляем высоту при загрузке
  sendHeight();

  // Отправляем при изменении размера
  window.addEventListener('resize', sendHeight);

  // Отправляем при изменении контента (MutationObserver)
  const observer = new MutationObserver(sendHeight);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  // Отправляем при навигации (hash change)
  window.addEventListener('hashchange', () => {
    setTimeout(sendHeight, 100);
  });

  // Отправляем периодически (fallback)
  setInterval(sendHeight, 1000);
}

