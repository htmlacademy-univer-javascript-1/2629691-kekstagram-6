import { debounce } from './util.js';
import { renderThumbnails } from './rendering_thumbnails.js';

const RANDOM_PHOTOS_COUNT = 10;

let currentFilter = 'default';
let originalPhotos = [];
let filteredPhotos = [];

const filterDefault = () => [...originalPhotos];

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

const filterDiscussed = () => [...originalPhotos].sort((a, b) => b.comments.length - a.comments.length);

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

const debouncedApplyFilter = debounce(applyFilter);

const initFilters = (photos) => {
  originalPhotos = [...photos];

  const filtersElement = document.querySelector('.img-filters');
  filtersElement.classList.remove('img-filters--inactive');

  const filterButtons = document.querySelectorAll('.img-filters__button');

  const onFilterButtonClick = (evt) => {
    filterButtons.forEach((button) => {
      button.classList.remove('img-filters__button--active');
    });

    evt.target.classList.add('img-filters__button--active');

    currentFilter = evt.target.id.replace('filter-', '');

    debouncedApplyFilter();
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', onFilterButtonClick);
  });

  applyFilter();
};

export { initFilters };
