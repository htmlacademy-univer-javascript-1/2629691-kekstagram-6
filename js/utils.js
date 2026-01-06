// Вспомогательные утилиты: случайные числа, элементы и debounce

// Случайное целое из диапазона [a, b]
const getRandomInteger = (a, b) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  const result = Math.random() * (upper - lower + 1) + lower;
  return Math.floor(result);
};

// Возвращает случайный элемент массива
const getRandomArrayElement = (elements) =>
  elements[getRandomInteger(0, elements.length - 1)];

// Функция для устранения дребезга (отложенный вызов)
function debounce(callback, timeoutDelay = 500) {
  let timeoutId;

  return (...rest) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(this, rest), timeoutDelay);
  };
}

export { getRandomInteger, getRandomArrayElement, debounce };
