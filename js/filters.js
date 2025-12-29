import { debounce } from './util.js';
import { renderThumbnails } from './rendering_thumbnails.js';

// Сколько случайных фото показывать
const RANDOM_PHOTOS_COUNT = 10;

let currentFilter = 'default';
let originalPhotos = [];
let filteredPhotos = [];

// Фильтр "По умолчанию" - все фото
const filterDefault = () => [...originalPhotos];

// Фильтр "Случайные" - 10 случайных фото
const filterRandom = () => {
  const photos = [...originalPhotos];
  const randomPhotos = [];

  for (let i = 0; i < Math.min(RANDOM_PHOTOS_COUNT, photos.length); i++) {
    const randomIndex = Math.floor(Math.random() * photos.length);
    randomPhotos.push(photos[randomIndex]);
    photos.splice(randomIndex, 1);
  }

  return randomPhotos;
};

// Фильтр "Обсуждаемые" - сортировка по комментариям
const filterDiscussed = () => [...originalPhotos].sort((a, b) => b.comments.length - a.comments.length);

// Применение выбранного фильтра
const applyFilter = () => {
  switch (currentFilter) {
    case 'default':
      filteredPhotos = filterDefault();
      break;
    case 'random':
      filteredPhotos = filterRandom();
      break;
    case 'discussed':
      filteredPhotos = filterDiscussed();
      break;
    default:
      filteredPhotos = filterDefault();
  }

  const picturesContainer = document.querySelector('.pictures');
  renderThumbnails(filteredPhotos, picturesContainer);
};

// Задержка для устранения дребезга
const debouncedApplyFilter = debounce(applyFilter);

// Инициализация фильтров
const initFilters = (photos) => {
  originalPhotos = [...photos];

  // Показываем блок с фильтрами
  const filtersElement = document.querySelector('.img-filters');
  filtersElement.classList.remove('img-filters--inactive');

  const filterButtons = document.querySelectorAll('.img-filters__button');

  // Обработчик клика по фильтру
  const onFilterButtonClick = (evt) => {
    // Убираем активный класс у всех кнопок
    filterButtons.forEach((button) => {
      button.classList.remove('img-filters__button--active');
    });

    // Добавляем активный класс нажатой кнопке
    evt.target.classList.add('img-filters__button--active');

    // Получаем тип фильтра из id кнопки
    currentFilter = evt.target.id.replace('filter-', '');

    // Применяем фильтр с задержкой
    debouncedApplyFilter();
  };

  // Вешаем обработчик на каждую кнопку
  filterButtons.forEach((button) => {
    button.addEventListener('click', onFilterButtonClick);
  });

  // Первоначальная отрисовка
  applyFilter();
};

export { initFilters };
