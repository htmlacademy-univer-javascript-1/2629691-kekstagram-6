// Работа с фильтрами списка фотографий
import { debounce } from './utils.js';
import { renderThumbnails } from './thumbnails.js';

const RANDOM_PHOTOS_COUNT = 10;

let currentFilter = 'default';        // текущий выбранный фильтр
let originalPhotos = [];              // исходный список фотографий
let filteredPhotos = [];              // отфильтрованный список
let activeFilterButton = null;        // ссылка на активную кнопку фильтра

// Возвращаем исходный список без изменений
const filterDefault = () => [...originalPhotos];

// Возвращаем случайный набор фотографий без повторов
const filterRandom = () => {
  const photosPool = [...originalPhotos];
  const randomPhotos = [];

  const count = Math.min(RANDOM_PHOTOS_COUNT, photosPool.length);

  for (let index = 0; index < count; index++) {
    const randomIndex = Math.floor(Math.random() * photosPool.length);
    randomPhotos.push(photosPool[randomIndex]);
    photosPool.splice(randomIndex, 1); // убираем выбранный элемент, чтобы не повторялся
  }

  return randomPhotos;
};

// Сортируем по количеству комментариев (самые обсуждаемые сверху)
const filterDiscussed = () =>
  [...originalPhotos].sort((first, second) => second.comments.length - first.comments.length);

// Применяем выбранный фильтр и перерисовываем миниатюры
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

// Делаем отложенное применение фильтра, чтобы не дергать рендер слишком часто
const debouncedApplyFilter = debounce(applyFilter);

// Инициализация блока фильтров
const initFilters = (photos) => {
  originalPhotos = [...photos];

  const filtersElement = document.querySelector('.img-filters');
  filtersElement.classList.remove('img-filters--inactive');

  const filterButtons = document.querySelectorAll('.img-filters__button');

  // Обработчик клика по кнопке фильтра
  const onFilterButtonClick = (evt) => {
    const target = evt.target;

    if (activeFilterButton) {
      activeFilterButton.classList.remove('img-filters__button--active');
    }

    target.classList.add('img-filters__button--active');
    activeFilterButton = target;

    // id вида filter-default / filter-random / filter-discussed
    currentFilter = target.id.replace('filter-', '');
    debouncedApplyFilter();
  };

  // Вешаем обработчики на кнопки и сразу активируем дефолтную
  filterButtons.forEach((button) => {
    if (button.id === 'filter-default') {
      button.classList.add('img-filters__button--active');
      activeFilterButton = button;
    }

    button.addEventListener('click', onFilterButtonClick);
  });

  applyFilter();
};

export { initFilters };
