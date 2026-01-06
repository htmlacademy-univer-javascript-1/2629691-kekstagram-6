// Генерация фейковых комментариев и фотографий для мок‑данных
import { getRandomInteger, getRandomArrayElement } from './utils.js';
import { NAMES, MESSAGES, DESCRIPTIONS } from './data.js';

// Создание случайного сообщения (1–2 фразы)
function generateMessage() {
  const messageCount = getRandomInteger(1, 2);
  const messages = [];

  for (let index = 0; index < messageCount; index++) {
    const randomMessage = getRandomArrayElement(MESSAGES);
    messages.push(randomMessage);
  }

  return messages.join(' ');
}

// Фабрика генератора уникальных ID для комментариев
function createId() {
  const usedIds = new Set();

  return function generateNewId() {
    let newId = getRandomInteger(1, 1000);

    while (usedIds.has(newId)) {
      newId = getRandomInteger(1, 1000);
    }

    usedIds.add(newId);

    return newId;
  };
}

const generateCommentId = createId();

// Создание одного комментария
function createComment() {
  const comment = {
    id: generateCommentId(),
    avatar: `img/avatar-${getRandomInteger(1, 6)}.svg`,
    message: generateMessage(),
    name: getRandomArrayElement(NAMES),
  };

  return comment;
}

// Создание одного объекта фотографии с комментами
function createPhoto(photoId) {
  const commentCount = getRandomInteger(0, 30);
  const comments = [];

  for (let index = 0; index < commentCount; index++) {
    const comment = createComment();
    comments.push(comment);
  }

  const photo = {
    id: photoId,
    url: `photos/${photoId}.jpg`,
    description: getRandomArrayElement(DESCRIPTIONS),
    likes: getRandomInteger(15, 200),
    comments,
  };

  return photo;
}

// Генерация массива всех фотографий
function generatePhotos() {
  const photos = [];
  const photoCount = 25;

  for (let index = 1; index <= photoCount; index++) {
    const photo = createPhoto(index);
    photos.push(photo);
  }

  return photos;
}

export { generatePhotos };
