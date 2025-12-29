import { getData } from './api.js';
import { renderThumbnails } from './rendering_thumbnails.js';
import { initFullscreenView } from './fullscreen.js';
import { initUploadForm } from './form.js';

// Время показа алерта
const ALERT_SHOW_TIME = 5000;

let userPhotos = [];

// Функция для показа алерта об ошибке
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

  // Автоматически скрываем через 5 секунд
  setTimeout(() => {
    alertContainer.remove();
  }, ALERT_SHOW_TIME);
};

// Загрузка фотографий с сервера
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

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  loadPhotos();
  initUploadForm();
});

export { userPhotos };
