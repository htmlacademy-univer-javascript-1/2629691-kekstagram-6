import { getRandomInteger, getRandomArrayElement } from './utils.js';
import { NAMES, MESSAGES, DESCRIPTIONS } from './data.js';

// Создание случайного сообщения
function generateMessage() {
  const messageCount = getRandomInteger(1, 2);
  const messages = [];
  for (let i = 0; i < messageCount; i++) {
    const randomMessage = getRandomArrayElement(MESSAGES);
    messages.push(randomMessage);
  }
  return messages.join(' ');
}

// Генератор уникальных ID для комментариев
function createId() {
  const usedIds = new Set();
  return function generateNewId() {
    let newId = getRandomInteger(1, 1000);
    // Ищем уникальный ID
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
    // Случайная аватарка от 1 до 6
    avatar: `img/avatar-${getRandomInteger(1, 6)}.svg`,
    message: generateMessage(),
    name: getRandomArrayElement(NAMES)
  };
  return comment;
}

// Создание данных для одной фотографии
function createPhoto(photoId) {
  const commentCount = getRandomInteger(0, 30);
  const comments = [];
  for (let i = 0; i < commentCount; i++) {
    const comment = createComment();
    comments.push(comment);
  }

  const photo = {
    id: photoId,
    url: `photos/${photoId}.jpg`,
    description: getRandomArrayElement(DESCRIPTIONS),
    likes: getRandomInteger(15, 200),
    comments: comments
  };
  return photo;
}

// Генерация 25 фотографий
function generatePhotos() {
  const photos = [];
  const photoCount = 25;
  for (let i = 1; i <= photoCount; i++) {
    const photo = createPhoto(i);
    photos.push(photo);
  }
  return photos;
}

export { generatePhotos };
