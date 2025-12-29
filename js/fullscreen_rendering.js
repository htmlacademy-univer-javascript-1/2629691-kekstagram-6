import { userPhotos } from './main.js';

// Находим элементы для полноэкранного просмотра
const bigPictureElement = document.querySelector('.big-picture');
const bigImgElement = bigPictureElement.querySelector('.big-picture__img img');
const likesCountElement = bigPictureElement.querySelector('.likes-count');
const commentsCountElement = bigPictureElement.querySelector('.comments-count');
const socialCommentsElement = bigPictureElement.querySelector('.social__comments');
const socialCaptionElement = bigPictureElement.querySelector('.social__caption');
const socialCommentCountElement = bigPictureElement.querySelector('.social__comment-count');
const commentsLoaderElement = bigPictureElement.querySelector('.comments-loader');
const closeButtonElement = bigPictureElement.querySelector('.big-picture__cancel');

// Количество комментариев на одной странице
const COMMENTS_PER_PAGE = 5;

// Создание элемента комментария
const createCommentElement = (comment) => {
  const commentElement = document.createElement('li');
  commentElement.classList.add('social__comment');

  // Аватарка
  const avatarImg = document.createElement('img');
  avatarImg.classList.add('social__picture');
  avatarImg.src = comment.avatar;
  avatarImg.alt = comment.name;
  avatarImg.width = 35;
  avatarImg.height = 35;

  // Текст комментария
  const commentText = document.createElement('p');
  commentText.classList.add('social__text');
  commentText.textContent = comment.message;

  // Собираем элемент
  commentElement.appendChild(avatarImg);
  commentElement.appendChild(commentText);

  return commentElement;
};

// Показать фото в полноэкранном режиме
const renderFullscreenPhoto = (photoData) => {
  socialCommentCountElement.classList.remove('hidden');
  commentsLoaderElement.classList.remove('hidden');

  // Заполняем информацию о фото
  bigImgElement.src = photoData.url;
  bigImgElement.alt = photoData.description;
  likesCountElement.textContent = photoData.likes;
  commentsCountElement.textContent = photoData.comments.length;
  socialCaptionElement.textContent = photoData.description;

  // Очищаем старые комментарии
  socialCommentsElement.innerHTML = '';

  let shownComments = 0;

  // Функция для отображения порции комментариев
  const renderCommentsPage = () => {
    const commentsToShow = photoData.comments.slice(shownComments, shownComments + COMMENTS_PER_PAGE);
    commentsToShow.forEach((comment) => {
      const commentElement = createCommentElement(comment);
      socialCommentsElement.appendChild(commentElement);
    });

    shownComments += commentsToShow.length;
    // Обновляем счётчик
    socialCommentCountElement.innerHTML = `${shownComments} из <span class="comments-count">${photoData.comments.length}</span> комментариев`;

    // Если показали все - скрываем кнопку
    if (shownComments >= photoData.comments.length) {
      commentsLoaderElement.classList.add('hidden');
    }
  };

  // Первая порция комментариев
  renderCommentsPage();

  // Обработчик кнопки "Загрузить ещё"
  const onCommentsLoaderClick = () => {
    renderCommentsPage();
  };

  commentsLoaderElement.addEventListener('click', onCommentsLoaderClick);

  // Сохраняем обработчик для удаления
  bigPictureElement._commentsLoaderHandler = onCommentsLoaderClick;

  // Показываем модальное окно
  bigPictureElement.classList.remove('hidden');
  document.body.classList.add('modal-open');
};

// Закрыть полноэкранный просмотр
const closeFullscreenPhoto = () => {
  if (bigPictureElement._commentsLoaderHandler) {
    commentsLoaderElement.removeEventListener('click', bigPictureElement._commentsLoaderHandler);
    delete bigPictureElement._commentsLoaderHandler;
  }

  bigPictureElement.classList.add('hidden');
  document.body.classList.remove('modal-open');
};

// Обработчик клика по миниатюре
const onThumbnailClick = (photoData) => {
  renderFullscreenPhoto(photoData);
};

// Инициализация полноэкранного просмотра
const initFullscreenView = () => {
  const thumbnails = document.querySelectorAll('.picture');

  // Вешаем обработчик на каждую миниатюру
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', (evt) => {
      evt.preventDefault();
      const currentId = parseInt(thumbnail.dataset.id, 10);
      // Находим данные фото по ID
      const currentData = userPhotos.find((item) => item.id === currentId);
      if (currentData) {
        onThumbnailClick(currentData);
      }
    });
  });

  // Закрытие по кнопке
  closeButtonElement.addEventListener('click', () => {
    closeFullscreenPhoto();
  });

  // Закрытие по Escape
  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      closeFullscreenPhoto();
    }
  });
};

export { initFullscreenView };
