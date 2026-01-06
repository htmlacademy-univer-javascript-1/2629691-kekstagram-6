// Точка входа: загрузка данных, показ миниатюр, запуск форм и полноэкранного режима
import { getData } from './api.js';
import { renderThumbnails } from './thumbnails.js';
import { initFullscreenView } from './fullscreen_rendering.js';
import { initUploadForm } from './form.js';

const ALERT_SHOW_TIME = 5000;

// сюда сохраняем фотографии пользователя для других модулей
let userPhotos = [];

// Показ простого алерта поверх страницы
const showAlert = (message) => {
  const alertContainer = document.createElement('div');
  alertContainer.style.zIndex = '100';
  alertContainer.style.position = 'fixed';
  alertContainer.style.left = '0';
  alertContainer.style.top = '0';
  alertContainer.style.right = '0';
  alertContainer.style.padding = '10px 3px';
  alertContainer.style.fontSize = '30px';
  alertContainer.style.textAlign = 'center';
  alertContainer.style.backgroundColor = 'red';
  alertContainer.style.color = 'white';
  alertContainer.textContent = message;

  document.body.append(alertContainer);

  setTimeout(() => {
    alertContainer.remove();
  }, ALERT_SHOW_TIME);
};

// Асинхронная загрузка фотографий с сервера
const loadPhotos = async () => {
  try {
    userPhotos = await getData();

    const picturesContainer = document.querySelector('.pictures');
    renderThumbnails(userPhotos, picturesContainer);
    initFullscreenView();
  } catch (error) {
    showAlert(error.message);
    userPhotos = [];
  }
};

// Инициализация приложения после загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
  loadPhotos();
  initUploadForm();
});

export { userPhotos };
