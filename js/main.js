//Список имен
const NAMES = [
  'Виктор', 'София', 'Роман', 'Алиса', 'Константин',
  'Дарья', 'Никита', 'Полина', 'Максим', 'Вероника',
  'Георгий', 'Ксения', 'Арсений', 'Анастасия', 'Тимофей'
];

// Список комментариев
const MESSAGES = [
  'Всё отлично!',
  'В целом всё неплохо. Но не всё.',
  'Когда вы делаете фотографию, хорошо бы убирать палец из кадра. В конце концов это просто непрофессионально.',
  'Моя бабушка случайно чихнула с фотоаппаратом в руках и у неё получилась фотография лучше.',
  'Я поскользнулся на банановой кожуре и уронил фотоаппарат на кота и у меня получилась фотография лучше.',
  'Лица у людей на фотке перекошены, как будто их избивают. Как можно было поймать такой неудачный момент?!'
];

// Список описаний для фотографий
const DESCRIPTIONS = [
  'Рассвет в горах',
  'Вечер у камина',
  'Прогулка по парку',
  'Семейное застолье',
  'Тихое утро на берегу озера',
  'Яркие краски летнего фестиваля',
  'Приключения в далеких странах',
  'Щенок в саду',
  'Вечерний город с высоты',
  'Зима в лесу',
  'В ресторане с друзьями',
  'Спортивные достижения и победы',
  'Романтический ужин при свечах',
  'Творческий процесс в мастерской',
  'Пикник на природе'
];

//Рандомное число в диапозоне
const getRandomInteger = (a, b) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  const result = Math.random() * (upper - lower + 1) + lower;
  return Math.floor(result);
};

const getRandomArrayElement = (elements) => elements[getRandomInteger(0, elements.length - 1)];

//Создание случайного сообщения
function generateMessage() {
  const messageCount = getRandomInteger(1, 2);
  const messages = [];
  for (let i = 0; i < messageCount; i++) {
    const randomMessage = getRandomArrayElement(MESSAGES);
    messages.push(randomMessage);
  }
  return messages.join(' ');
}

// Функция для создания уникальных ID(для комментариев)
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

// Функция для создания комментария
function createComment() {
  const comment = {
    id: generateCommentId(),
    avatar: `img/avatar-${getRandomInteger(1, 6)}.svg`,
    message: generateMessage(),
    name: getRandomArrayElement(NAMES)
  };
  return comment;
}

// Функция для создания одной фотографии
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

// Функция для создания всех фотографий
function generatePhotos() {
  const photos = [];
  const photoCount = 25;
  for (let i = 1; i <= photoCount; i++) {
    const photo = createPhoto(i);
    photos.push(photo);
  }
  return photos;
}
generatePhotos();
