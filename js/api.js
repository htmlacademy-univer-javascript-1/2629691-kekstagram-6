// Работа с сетью: загрузка и отправка данных на сервер проекта
const BASE_URL = 'https://29.javascript.htmlacademy.pro/kekstagram';

const Route = {
  GET_DATA: '/data',
  SEND_DATA: '/',
};

const Method = {
  GET: 'GET',
  POST: 'POST',
};

const ErrorText = {
  GET_DATA: 'Не удалось загрузить данные. Попробуйте обновить страницу',
  SEND_DATA: 'Не удалось отправить форму. Попробуйте ещё раз',
};

// Универсальная функция для работы с fetch
const load = async (route, errorText, method = Method.GET, body = null) => {
  try {
    const response = await fetch(`${BASE_URL}${route}`, {
      method,
      body,
    });

    if (!response.ok) {
      throw new Error();
    }

    return await response.json();
  } catch (error) {
    // Пробрасываем свою ошибку с понятным текстом
    throw new Error(errorText);
  }
};

// Получаем список фотографий
const getData = () => load(Route.GET_DATA, ErrorText.GET_DATA);

// Отправляем форму с фото
const sendData = (body) => load(Route.SEND_DATA, ErrorText.SEND_DATA, Method.POST, body);

export { getData, sendData };

