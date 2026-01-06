// Создание одной миниатюры по данным фотографии
const createThumbnail = (pictureData) => {
  const pictureTemplate = document.querySelector('#picture');
  const thumbnailElement = pictureTemplate.content.querySelector('.picture').cloneNode(true);

  thumbnailElement.dataset.id = pictureData.id;

  // Картинка
  const thumbImg = thumbnailElement.querySelector('.picture__img');
  thumbImg.src = pictureData.url;
  thumbImg.alt = pictureData.description;

  // Количество комментариев
  const thumbComments = thumbnailElement.querySelector('.picture__comments');
  thumbComments.textContent = pictureData.comments.length;

  // Лайки
  const thumbLikes = thumbnailElement.querySelector('.picture__likes');
  thumbLikes.textContent = pictureData.likes;

  return thumbnailElement;
};

// Отрисовка миниатюр в контейнере
const renderThumbnails = (picturesList, picturesContainer) => {
  const renderFragment = document.createDocumentFragment();

  picturesList.forEach((pictureItem) => {
    const thumbnail = createThumbnail(pictureItem);
    renderFragment.appendChild(thumbnail);
  });

  // Удаляем старые миниатюры, если они были
  const oldThumbnails = picturesContainer.querySelectorAll('.picture');
  oldThumbnails.forEach((thumb) => thumb.remove());

  picturesContainer.appendChild(renderFragment);
};

export { renderThumbnails };

