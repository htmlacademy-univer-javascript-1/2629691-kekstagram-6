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

// Инициализация Pristine
let pristine = null;
if (typeof Pristine !== 'undefined') {
  pristine = new Pristine(uploadForm, {
    classTo: 'img-upload__field-wrapper',
    errorTextParent: 'img-upload__field-wrapper',
    errorTextClass: 'img-upload__field-wrapper--error'
  });
}

// Настройки эффектов
const EFFECTS = {
  none: {
    min: 0,
    max: 100,
    step: 1,
    filter: 'none',
    unit: ''
  },
  chrome: {
    min: 0,
    max: 1,
    step: 0.1,
    filter: 'grayscale',
    unit: ''
  },
  sepia: {
    min: 0,
    max: 1,
    step: 0.1,
    filter: 'sepia',
    unit: ''
  },
  marvin: {
    min: 0,
    max: 100,
    step: 1,
    filter: 'invert',
    unit: '%'
  },
  phobos: {
    min: 0,
    max: 3,
    step: 0.1,
    filter: 'blur',
    unit: 'px'
  },
  heat: {
    min: 1,
    max: 3,
    step: 0.1,
    filter: 'brightness',
    unit: ''
  }
};

let currentEffect = 'none';
let slider = null;

// Масштабирование
const SCALE_STEP = 25;
const SCALE_MIN = 25;
const SCALE_MAX = 100;
let currentScale = 100;

let messageBlock = null;
let closeMessage = function() {};

function updateScale() {
  scaleValue.value = `${currentScale}%`;
  previewImage.style.transform = `scale(${currentScale / 100})`;
}

function onScaleSmallerClick() {
  if (currentScale > SCALE_MIN) {
    currentScale -= SCALE_STEP;
    updateScale();
  }
}

function onScaleBiggerClick() {
  if (currentScale < SCALE_MAX) {
    currentScale += SCALE_STEP;
    updateScale();
  }
}

function applyEffect(value) {
  if (currentEffect === 'none') {
    previewImage.style.filter = 'none';
    return;
  }

  const effect = EFFECTS[currentEffect];
  previewImage.style.filter = `${effect.filter}(${value}${effect.unit})`;
}

// Инициализация слайдера
function initSlider() {
  if (typeof noUiSlider !== 'undefined') {
    slider = noUiSlider.create(effectLevelSlider, {
      range: {
        min: EFFECTS[currentEffect].min,
        max: EFFECTS[currentEffect].max
      },
      start: EFFECTS[currentEffect].max,
      step: EFFECTS[currentEffect].step,
      connect: 'lower'
    });

    slider.on('update', () => {
      const value = slider.get();
      effectLevelValue.value = value;
      applyEffect(value);
    });
  }
}

function updateSlider() {
  if (slider) {
    slider.updateOptions({
      range: {
        min: EFFECTS[currentEffect].min,
        max: EFFECTS[currentEffect].max
      },
      start: EFFECTS[currentEffect].max,
      step: EFFECTS[currentEffect].step
    });
  }
}

function onEffectChange(evt) {
  if (evt.target.type === 'radio') {
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
}

// Парсер хэш-тегов
function parseTagsInput(input) {
  if (!input) {
    return [];
  }
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// Проверка формата одного тега
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

// Валидация хэш-тегов
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
      validateHashtags.lastError = `Неправильный формат тега "${tag}". Тег должен начинаться с # и содержать только буквы и цифры, длина до 20 символов.`;
      return false;
    }
  }

  const lowered = tags.map((t) => t.toLowerCase());
  const unique = new Set(lowered);
  if (unique.size !== lowered.length) {
    validateHashtags.lastError = 'Один и тот же хэш-тег не может быть использован дважды.';
    return false;
  }

  return true;
}

// Сообщение об ошибке для хэш-тегов
function hashtagsErrorMessage() {
  return validateHashtags.lastError || 'Неправильный формат хэш-тегов.';
}

// Валидация комментария
function validateDescription(value) {
  if (value.length <= 140) {
    return true;
  }
  return false;
}

// Обработчик клавиши Esc для формы
function onDocumentKeydown(evt) {
  if (evt.key === 'Escape') {
    if (uploadOverlay.classList.contains('hidden')) {
      return;
    }

    const isFocusedOnInput = document.activeElement === hashtagsInput ||
                            document.activeElement === descriptionInput;

    if (!isFocusedOnInput) {
      closeUploadForm();
    }
  }
}

// Сброс формы к исходному состоянию
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

// Обработчики клавиш для сообщений
function onEscapeKeydown(evt) {
  if (evt.key === 'Escape') {
    closeMessage();
  }
}

function onClickOutside(evt) {
  if (messageBlock && !messageBlock.contains(evt.target)) {
    closeMessage();
  }
}

// Функции для показа/скрытия сообщений
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

function showSuccessMessage() {
  showMessage('success', () => {
    resetFormToInitialState();
    closeUploadForm();
  });
}

function showErrorMessage() {
  showMessage('error');
  submitButton.disabled = false;
}

// Функции для открытия/закрытия формы
function openUploadForm() {
  uploadOverlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);

  // Сброс масштаба
  currentScale = 100;
  updateScale();

  // Сброс эффектов
  currentEffect = 'none';
  const noneEffectRadio = uploadOverlay.querySelector('#effect-none');
  if (noneEffectRadio) {
    noneEffectRadio.checked = true;
  }

  effectLevelContainer.classList.add('hidden');
  previewImage.style.filter = 'none';

  // Инициализация слайдера
  if (!slider) {
    initSlider();
  } else {
    updateSlider();
  }
}

function closeUploadForm() {
  resetFormToInitialState();
  uploadOverlay.classList.add('hidden');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
}

function initUploadForm() {
  if (pristine) {
    pristine.addValidator(hashtagsInput, validateHashtags, hashtagsErrorMessage);
    pristine.addValidator(descriptionInput, validateDescription, 'Длина комментария не может превышать 140 символов.');
  }

  scaleSmaller.addEventListener('click', onScaleSmallerClick);
  scaleBigger.addEventListener('click', onScaleBiggerClick);

  effectsList.addEventListener('change', onEffectChange);

  // Загрузка файла
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

  // Предотвращение закрытия формы при фокусе на полях ввода
  [hashtagsInput, descriptionInput].forEach((el) => {
    el.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') {
        evt.stopPropagation();
      }
    });
  });

  // Отправка формы
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
