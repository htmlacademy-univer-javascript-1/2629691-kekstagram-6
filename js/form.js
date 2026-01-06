// Логика формы загрузки фото, масштаб, эффекты, валидация и отправка
import { sendData } from './api.js';

const uploadForm = document.querySelector('.img-upload__form');
const uploadInput = document.querySelector('.img-upload__input');
const uploadOverlay = document.querySelector('.img-upload__overlay');
const uploadCancel = document.querySelector('.img-upload__cancel');

const hashtagsInput = uploadForm.querySelector('.text__hashtags');
const descriptionInput = uploadForm.querySelector('.text__description');
const submitButton = uploadForm.querySelector('.img-upload__submit');

// Элементы для масштабирования
const scaleSmaller = uploadOverlay.querySelector('.scale__control--smaller');
const scaleBigger = uploadOverlay.querySelector('.scale__control--bigger');
const scaleValue = uploadOverlay.querySelector('.scale__control--value');
const previewImage = uploadOverlay.querySelector('.img-upload__preview img');

// Элементы для эффектов
const effectsList = uploadOverlay.querySelector('.effects__list');
const effectLevelContainer = uploadOverlay.querySelector('.img-upload__effect-level');
const effectLevelValue = uploadOverlay.querySelector('.effect-level__value');
const effectLevelSlider = uploadOverlay.querySelector('.effect-level__slider');

// Инициализация Pristine (если библиотека подключена)
let pristine = null;

if (typeof Pristine !== 'undefined') {
  pristine = new Pristine(uploadForm, {
    classTo: 'img-upload__field-wrapper',
    errorTextParent: 'img-upload__field-wrapper',
    errorTextClass: 'img-upload__field-wrapper--error',
  });
}

// Настройки эффектов для noUiSlider и CSS-фильтров
const EFFECTS = {
  none: {
    min: 0,
    max: 100,
    step: 1,
    filter: 'none',
    unit: '',
  },
  chrome: {
    min: 0,
    max: 1,
    step: 0.1,
    filter: 'grayscale',
    unit: '',
  },
  sepia: {
    min: 0,
    max: 1,
    step: 0.1,
    filter: 'sepia',
    unit: '',
  },
  marvin: {
    min: 0,
    max: 100,
    step: 1,
    filter: 'invert',
    unit: '%',
  },
  phobos: {
    min: 0,
    max: 3,
    step: 0.1,
    filter: 'blur',
    unit: 'px',
  },
  heat: {
    min: 1,
    max: 3,
    step: 0.1,
    filter: 'brightness',
    unit: '',
  },
};

let currentEffect = 'none';
let slider = null;

// Параметры масштаба
const SCALE_STEP = 25;
const SCALE_MIN = 25;
const SCALE_MAX = 100;

let currentScale = 100;

// Переменные для сообщений об ошибке/успехе
let messageBlock = null;
// Функция-заглушка, чтобы можно было вызвать до инициализации сообщения
let closeMessage = () => {};

// Обновление визуального масштаба превью
function updateScale() {
  scaleValue.value = `${currentScale}%`;
  previewImage.style.transform = `scale(${currentScale / 100})`;
}

// Уменьшение масштаба
function onScaleSmallerClick() {
  if (currentScale > SCALE_MIN) {
    currentScale -= SCALE_STEP;
    updateScale();
  }
}

// Увеличение масштаба
function onScaleBiggerClick() {
  if (currentScale < SCALE_MAX) {
    currentScale += SCALE_STEP;
    updateScale();
  }
}

// Применение выбранного эффекта к изображению
function applyEffect(value) {
  if (currentEffect === 'none') {
    previewImage.style.filter = 'none';
    return;
  }

  const effect = EFFECTS[currentEffect];
  previewImage.style.filter = `${effect.filter}(${value}${effect.unit})`;
}

// Инициализация слайдера эффектов (noUiSlider)
function initSlider() {
  if (typeof noUiSlider === 'undefined' || slider) {
    return;
  }

  slider = noUiSlider.create(effectLevelSlider, {
    range: {
      min: EFFECTS[currentEffect].min,
      max: EFFECTS[currentEffect].max,
    },
    start: EFFECTS[currentEffect].max,
    step: EFFECTS[currentEffect].step,
    connect: 'lower',
  });

  slider.on('update', () => {
    const value = slider.get();
    effectLevelValue.value = value;
    applyEffect(value);
  });
}

// Обновление настроек слайдера под текущий эффект
function updateSlider() {
  if (!slider) {
    return;
  }

  slider.updateOptions({
    range: {
      min: EFFECTS[currentEffect].min,
      max: EFFECTS[currentEffect].max,
    },
    start: EFFECTS[currentEffect].max,
    step: EFFECTS[currentEffect].step,
  });
}

// Обработка переключения эффекта через радио-кнопки
function onEffectChange(evt) {
  if (evt.target.type !== 'radio') {
    return;
  }

  currentEffect = evt.target.value;

  if (slider) {
    slider.set(EFFECTS[currentEffect].max);
  }

  updateSlider();

  if (currentEffect === 'none') {
    effectLevelContainer.classList.add('hidden');
  } else {
    effectLevelContainer.classList.remove('hidden');
  }

  applyEffect(EFFECTS[currentEffect].max);
}

// Разбор строки с хеш‑тегами в массив
function parseTagsInput(input) {
  if (!input) {
    return [];
  }

  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// Проверка формата одного хеш‑тега
function isValidTagFormat(tag) {
  if (tag[0] !== '#') {
    return false;
  }

  if (tag.length === 1) {
    return false;
  }

  if (tag.length > 20) {
    return false;
  }

  return /^[A-Za-zА-Яа-яЁё0-9]+$/.test(tag.slice(1));
}

// Валидация хеш‑тегов
function validateHashtags(value) {
  const tags = parseTagsInput(value);

  if (tags.length === 0) {
    return true;
  }

  if (tags.length > 5) {
    validateHashtags.lastError = 'Нельзя указать больше пяти хэш-тегов.';
    return false;
  }

  for (const tag of tags) {
    if (!isValidTagFormat(tag)) {
      validateHashtags.lastError =
        `Неправильный формат тега "${tag}". Тег должен начинаться с # и содержать только буквы и цифры, длина до 20 символов.`;
      return false;
    }
  }

  const lowered = tags.map((tag) => tag.toLowerCase());
  const unique = new Set(lowered);

  if (unique.size !== lowered.length) {
    validateHashtags.lastError = 'Один и тот же хэш-тег не может быть использован дважды.';
    return false;
  }

  return true;
}

// Сообщение об ошибке для Pristine по хеш‑тегам
function hashtagsErrorMessage() {
  return validateHashtags.lastError || 'Неправильный формат хэш-тегов.';
}

// Валидация описания (комментария к фото)
function validateDescription(value) {
  return value.length <= 140;
}

// Закрытие формы по Escape (если фокус не в полях ввода)
function onDocumentKeydown(evt) {
  if (evt.key !== 'Escape') {
    return;
  }

  if (uploadOverlay.classList.contains('hidden')) {
    return;
  }

  const isFocusedOnInput =
    document.activeElement === hashtagsInput ||
    document.activeElement === descriptionInput;

  if (!isFocusedOnInput) {
    closeUploadForm();
  }
}

// Сброс всех настроек формы к начальному состоянию
function resetFormToInitialState() {
  currentScale = 100;
  updateScale();

  currentEffect = 'none';
  const noneEffectRadio = uploadOverlay.querySelector('#effect-none');

  if (noneEffectRadio) {
    noneEffectRadio.checked = true;
  }

  effectLevelContainer.classList.add('hidden');
  previewImage.style.filter = 'none';

  uploadForm.reset();
  hashtagsInput.value = '';
  descriptionInput.value = '';
  uploadInput.value = '';

  previewImage.src = 'img/upload-default-image.jpg';

  if (pristine) {
    pristine.reset();
  }

  submitButton.disabled = false;
}

// Закрытие сообщения по Escape
function onEscapeKeydown(evt) {
  if (evt.key === 'Escape') {
    closeMessage();
  }
}

// Закрытие сообщения по клику вне блока
function onClickOutside(evt) {
  if (messageBlock && !messageBlock.contains(evt.target)) {
    closeMessage();
  }
}

// Универсальный показ сообщения (успех/ошибка)
function showMessage(templateId, closeCallback) {
  const template = document.querySelector(`#${templateId}`);

  if (!template) {
    return;
  }

  const messageElement = template.content.cloneNode(true);
  messageBlock = messageElement.querySelector(`.${templateId}`);

  if (!messageBlock) {
    return;
  }

  document.body.append(messageBlock);

  closeMessage = () => {
    messageBlock.remove();
    document.removeEventListener('keydown', onEscapeKeydown);
    document.removeEventListener('click', onClickOutside);
  };

  const closeButton = messageBlock.querySelector(`.${templateId}__button`);

  if (closeButton) {
    closeButton.addEventListener('click', closeMessage);
  }

  document.addEventListener('keydown', onEscapeKeydown);
  document.addEventListener('click', onClickOutside);

  if (closeCallback) {
    closeCallback();
  }
}

// Сообщение об успешной отправке
function showSuccessMessage() {
  showMessage('success', () => {
    resetFormToInitialState();
    closeUploadForm();
  });
}

// Сообщение об ошибке отправки
function showErrorMessage() {
  showMessage('error');
  submitButton.disabled = false;
}

// Открытие модального окна формы
function openUploadForm() {
  uploadOverlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);

  currentScale = 100;
  updateScale();

  currentEffect = 'none';
  const noneEffectRadio = uploadOverlay.querySelector('#effect-none');

  if (noneEffectRadio) {
    noneEffectRadio.checked = true;
  }

  effectLevelContainer.classList.add('hidden');
  previewImage.style.filter = 'none';

  if (!slider) {
    initSlider();
  } else {
    updateSlider();
  }
}

// Закрытие модального окна формы
function closeUploadForm() {
  resetFormToInitialState();
  uploadOverlay.classList.add('hidden');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
}

// Инициализация обработчиков формы загрузки
function initUploadForm() {
  if (pristine) {
    pristine.addValidator(hashtagsInput, validateHashtags, hashtagsErrorMessage);
    pristine.addValidator(descriptionInput, validateDescription, 'Длина комментария не может превышать 140 символов.');
  }

  // Масштаб
  scaleSmaller.addEventListener('click', onScaleSmallerClick);
  scaleBigger.addEventListener('click', onScaleBiggerClick);

  // Эффекты
  effectsList.addEventListener('change', onEffectChange);

  // Загрузка файла и открытие формы
  uploadInput.addEventListener('change', () => {
    if (uploadInput.files && uploadInput.files.length > 0) {
      const file = uploadInput.files[0];
      const reader = new FileReader();

      reader.onload = (evt) => {
        previewImage.src = evt.target.result;
        openUploadForm();
      };

      reader.readAsDataURL(file);
    }
  });

  // Кнопка отмены
  uploadCancel.addEventListener('click', (evt) => {
    evt.preventDefault();
    closeUploadForm();
  });

  // Чтобы Escape внутри полей ввода не закрывал форму
  [hashtagsInput, descriptionInput].forEach((element) => {
    element.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') {
        evt.stopPropagation();
      }
    });
  });

  // Отправка формы на сервер
  uploadForm.addEventListener('submit', async (evt) => {
    evt.preventDefault();

    if (pristine && !pristine.validate()) {
      return;
    }

    submitButton.disabled = true;

    try {
      const formData = new FormData(uploadForm);
      await sendData(formData);
      showSuccessMessage();
    } catch (error) {
      showErrorMessage();
    }
  });
}

export { initUploadForm, closeUploadForm };

