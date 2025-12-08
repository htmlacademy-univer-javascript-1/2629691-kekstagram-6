import { userPhotos } from './main.js';

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

const bigPictureElement = document.querySelector('.big-picture');
const bigImgElement = bigPictureElement.querySelector('.big-picture__img img');
const likesCountElement = bigPictureElement.querySelector('.likes-count');
const commentsCountElement = bigPictureElement.querySelector('.comments-count');
const socialCommentsElement = bigPictureElement.querySelector('.social__comments');
const socialCaptionElement = bigPictureElement.querySelector('.social__caption');
const socialCommentCountElement = bigPictureElement.querySelector('.social__comment-count');
const commentsLoaderElement = bigPictureElement.querySelector('.comments-loader');

const renderFullscreenPhoto = (photoData) => {
  socialCommentCountElement.classList.add('hidden');
  commentsLoaderElement.classList.add('hidden');

  bigImgElement.src = photoData.url;
  bigImgElement.alt = photoData.description;
  likesCountElement.textContent = photoData.likes;
  commentsCountElement.textContent = photoData.comments.length;
  socialCaptionElement.textContent = photoData.description;

  socialCommentsElement.innerHTML = '';

  photoData.comments.forEach((comment) => {
    const commentElement = createCommentElement(comment);
    socialCommentsElement.appendChild(commentElement);
  });

  bigPictureElement.classList.remove('hidden');
  document.body.classList.add('modal-open');
};

const closeFullscreenPhoto = () => {
  const bigPicture = document.querySelector('.big-picture');
  bigPicture.classList.add('hidden');
  document.body.classList.remove('modal-open');
};

const onThumbnailClick = (photoData) => {
  renderFullscreenPhoto(photoData);
};

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

  const closeButton = document.querySelector('.big-picture__cancel');
  closeButton.addEventListener('click', () => {
    closeFullscreenPhoto();
  });

  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      closeFullscreenPhoto();
    }
  });
};

export { initFullscreenView };
