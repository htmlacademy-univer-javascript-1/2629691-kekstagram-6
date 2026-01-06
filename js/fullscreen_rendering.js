// Полноэкранный просмотр фотографии и подгрузка комментариев
import { userPhotos } from './main.js';

const bigPictureElement = document.querySelector('.big-picture');
const bigImgElement = bigPictureElement.querySelector('.big-picture__img img');
const likesCountElement = bigPictureElement.querySelector('.likes-count');
const commentsCountElement = bigPictureElement.querySelector('.comments-count');
const socialCommentsElement = bigPictureElement.querySelector('.social__comments');
const socialCaptionElement = bigPictureElement.querySelector('.social__caption');
const socialCommentCountElement = bigPictureElement.querySelector('.social__comment-count');
const commentsLoaderElement = bigPictureElement.querySelector('.comments-loader');
const closeButtonElement = bigPictureElement.querySelector('.big-picture__cancel');

const COMMENTS_PER_PAGE = 5;

// Создаём DOM‑элемент одного комментария
const createCommentElement = (comment) => {
  const commentElement = document.createElement('li');
  commentElement.classList.add('social__comment');

  const avatarImg = document.createElement('img');
  avatarImg.classList.add('social__picture');
  avatarImg.src = comment.avatar;
  avatarImg.alt = comment.name;
  avatarImg.width = 35;
  avatarImg.height = 35;

  const commentText = document.createElement('p');
  commentText.classList.add('social__text');
  commentText.textContent = comment.message;

  commentElement.appendChild(avatarImg);
  commentElement.appendChild(commentText);

  return commentElement;
};

// Отрисовываем полноэкранную карточку фото
const renderFullscreenPhoto = (photoData) => {
  socialCommentCountElement.classList.remove('hidden');
  commentsLoaderElement.classList.remove('hidden');

  bigImgElement.src = photoData.url;
  bigImgElement.alt = photoData.description;
  likesCountElement.textContent = photoData.likes;
  commentsCountElement.textContent = photoData.comments.length;
  socialCaptionElement.textContent = photoData.description;

  socialCommentsElement.innerHTML = '';

  let shownComments = 0;

  // Порционная отрисовка комментариев
  const renderCommentsPage = () => {
    const commentsToShow = photoData.comments.slice(shownComments, shownComments + COMMENTS_PER_PAGE);

    commentsToShow.forEach((comment) => {
      const commentElement = createCommentElement(comment);
      socialCommentsElement.appendChild(commentElement);
    });

    shownComments += commentsToShow.length;
    socialCommentCountElement.innerHTML = `${shownComments} из ${photoData.comments.length} комментариев`;

    if (shownComments >= photoData.comments.length) {
      commentsLoaderElement.classList.add('hidden');
    }
  };

  renderCommentsPage();

  const onCommentsLoaderClick = () => {
    renderCommentsPage();
  };

  commentsLoaderElement.addEventListener('click', onCommentsLoaderClick);

  // Сохраняем обработчик на DOM‑элемент, чтобы потом снять
  bigPictureElement._commentsLoaderHandler = onCommentsLoaderClick;

  bigPictureElement.classList.remove('hidden');
  document.body.classList.add('modal-open');
};

// Закрытие полноэкранного режима
const closeFullscreenPhoto = () => {
  if (bigPictureElement._commentsLoaderHandler) {
    commentsLoaderElement.removeEventListener('click', bigPictureElement._commentsLoaderHandler);
    delete bigPictureElement._commentsLoaderHandler;
  }

  bigPictureElement.classList.add('hidden');
  document.body.classList.remove('modal-open');
};

// Обработка клика по миниатюре
const onThumbnailClick = (photoData) => {
  renderFullscreenPhoto(photoData);
};

// Подключаем обработчики к миниатюрам
const initFullscreenView = () => {
  const thumbnails = document.querySelectorAll('.picture');

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', (evt) => {
      evt.preventDefault();

      const currentId = parseInt(thumbnail.dataset.id, 10);
      const currentData = userPhotos.find((item) => item.id === currentId);

      if (currentData) {
        onThumbnailClick(currentData);
      }
    });
  });

  closeButtonElement.addEventListener('click', () => {
    closeFullscreenPhoto();
  });

  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape' && !bigPictureElement.classList.contains('hidden')) {
      closeFullscreenPhoto();
    }
  });
};

export { initFullscreenView };

