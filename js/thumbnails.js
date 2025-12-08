// Создание миниатюры
const createThumbnail = (pictureData) => {
  const pictureTemplate = document.querySelector('#picture');
  const thumbnailElement = pictureTemplate.content.querySelector('.picture').cloneNode(true);
  thumbnailElement.dataset.id = pictureData.id;

  //Действия над картинками
  const thumbImg = thumbnailElement.querySelector('.pictureimg');
  thumbImg.src = pictureData.url;
  thumbImg.alt = pictureData.description;

  //Действия над комментариями
  const thumbComments = thumbnailElement.querySelector('.picturecomments');
  thumbComments.textContent = pictureData.comments.length;

  //Действия над лайками
  const thumbLikes = thumbnailElement.querySelector('.picture__likes');
  thumbLikes.textContent = pictureData.likes;
  return thumbnailElement;
};

// Отрисовка миниатюр
const renderThumbnails = (picturesList, picturesContainer) => {
  const renderFragment = document.createDocumentFragment();

  picturesList.forEach((pictureItem) => {
    const thumbnail = createThumbnail(pictureItem);
    renderFragment.appendChild(thumbnail);
  });

  const oldThumbnails = picturesContainer.querySelectorAll('.picture');
  oldThumbnails.forEach((thumb) => thumb.remove());

  picturesContainer.appendChild(renderFragment);
};

export { renderThumbnails };
