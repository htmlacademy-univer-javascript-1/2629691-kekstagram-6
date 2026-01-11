// Логика формы загрузки фото: масштаб, эффекты, валидация и отправка
import { sendData } from './api.js';

// DOM
const uploadForm = document.querySelector('.img-upload__form');
const uploadInput = document.querySelector('.img-upload__input');
const uploadOverlay = document.querySelector('.img-upload__overlay');
const uploadCancel = document.querySelector('.img-upload__cancel');

const hashtagsInput = uploadForm.querySelector('.text__hashtags');
const descriptionInput = uploadForm.querySelector('.text__description');
const submitButton = uploadForm.querySelector('.img-upload__submit');

// Масштабирование
const scaleSmaller = uploadOverlay.querySelector('.scale__control--smaller');
const scaleBigger = uploadOverlay.querySelector('.scale__control--bigger');
const scaleValue = uploadOverlay.querySelector('.scale__control--value');
const previewImage = uploadOverlay.querySelector('.img-upload__preview img');

// Эффекты
const effectsList = uploadOverlay.querySelector('.effects__list');
const effectLevelContainer = uploadOverlay.querySelector('.img-upload__effect-level');
const effectLevelValue = uploadOverlay.querySelector('.effect-level__value');
const effectLevelSlider = uploadOverlay.querySelector('.effect-level__slider');

// Константы (настройки)
const SCALE_STEP = 25;
const SCALE_MIN = 25;
const SCALE_MAX = 100;
const SCALE_DEFAULT = 100;

const MAX_HASHTAGS_COUNT = 5;
const MAX_HASHTAG_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 140;

const DEFAULT_PREVIEW_IMAGE_SRC = 'img/upload-default-image.jpg';

// Конфигурация эффектов (noUiSlider + CSS filter)
const EFFECTS = {
  none: {
    slider: null,
    filter: null,
    unit: '',
  },
  chrome: {
    slider: { min: 0, max: 1, step: 0.1 },
    filter: 'grayscale',
    unit: '',
  },
  sepia: {
    slider: { min: 0, max: 1, step: 0.1 },
    filter: 'sepia',
    unit: '',
  },
  marvin: {
    slider: { min: 0, max: 100, step: 1 },
    filter: 'invert',
    unit: '%',
  },
  phobos: {
    slider: { min: 0, max: 3, step: 0.1 },
    filter: 'blur',
    unit: 'px',
  },
  heat: {
    slider: { min: 1, max: 3, step: 0.1 },
    filter: 'brightness',
    unit: '',
  },
};

// Состояние
let pristine = null;
let currentScale = SCALE_DEFAULT;
let currentEffect = 'none';
let slider = null;

// Сообщения об ошибке/успехе
let messageBlock = null;

// ---------- Pristine (валидация) ----------
if (typeof Pristine !== 'undefined') {
  pristine = new Pristine(uploadForm, {
    classTo: 'img-upload__text',
    errorTextParent: 'img-upload__text',
    errorTextClass: 'img-upload__error',
  });
}

// ---------- Масштаб ----------
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

// ---------- Эффекты + слайдер ----------
function applyEffect(value) {
  const effectConfig = EFFECTS[currentEffect];

  if (!effectConfig || currentEffect === 'none') {
    previewImage.style.filter = 'none';
    effectLevelValue.value = '';
    return;
  }

  const filterValue = `${effectConfig.filter}(${value}${effectConfig.unit})`;
  previewImage.style.filter = filterValue;
  effectLevelValue.value = value;
}

function updateSlider() {
  const effectConfig = EFFECTS[currentEffect];

  if (!effectConfig || currentEffect === 'none') {
    effectLevelContainer.classList.add('hidden');
    previewImage.style.filter = 'none';

    if (slider) {
      slider.noUiSlider.set(0);
    }

    return;
  }

  effectLevelContainer.classList.remove('hidden');

  slider.noUiSlider.updateOptions({
    range: { min: effectConfig.slider.min, max: effectConfig.slider.max },
    step: effectConfig.slider.step,
    start: effectConfig.slider.max,
    connect: 'lower',
  });

  slider.noUiSlider.set(effectConfig.slider.max);
}

function initSlider() {
  if (!effectLevelSlider || typeof noUiSlider === 'undefined') {
    return;
  }

  noUiSlider.create(effectLevelSlider, {
    range: { min: 0, max: 1 },
    step: 0.1,
    start: 1,
    connect: 'lower',
  });

  slider = effectLevelSlider;

  slider.noUiSlider.on('update', () => {
    const value = slider.noUiSlider.get();
    applyEffect(value);
  });
}

function onEffectChange(evt) {
  const target = evt.target;

  if (!target || target.name !== 'effect') {
    return;
  }

  currentEffect = target.value;
  updateSlider();
}

// ---------- Хеш-теги ----------
function parseTagsInput(value) {
  return value
    .trim()
    .split(' ')
    .filter((tag) => tag.trim().length > 0);
}

function isValidTagFormat(tag) {
  if (!tag.startsWith('#')) {
    return false;
  }

  if (tag.length === 1) {
    return false;
  }

  if (tag.length > MAX_HASHTAG_LENGTH) {
    return false;
  }

  return /^[A-Za-zА-Яа-яЁё0-9]+$/.test(tag.slice(1));
}

function validateHashtags(value) {
  validateHashtags.lastError = '';

  const tags = parseTagsInput(value);

  if (tags.length === 0) {
    return true;
  }

  if (tags.length > MAX_HASHTAGS_COUNT) {
    validateHashtags.lastError = `Нельзя указать больше ${MAX_HASHTAGS_COUNT} хэш-тегов.`;
    return false;
  }

  for (const tag of tags) {
    if (!isValidTagFormat(tag)) {
      validateHashtags.lastError =
        `Неправильный формат тега "${tag}". Тег должен начинаться с # и содержать только буквы и цифры, длина до ${MAX_HASHTAG_LENGTH} символов.`;
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

function hashtagsErrorMessage() {
  return validateHashtags.lastError || 'Неправильный формат хэш-тегов.';
}

// ---------- Описание ----------
function validateDescription(value) {
  return value.length <= MAX_DESCRIPTION_LENGTH;
}

// ---------- Сообщения (success/error) ----------
function showMessage(type, onClose = null) {
  if (messageBlock) {
    messageBlock.remove();
    messageBlock = null;
  }

  const template = document.querySelector(`#${type}`);
  if (!template) {
    return;
  }

  const messageElement = template.content.firstElementChild.cloneNode(true);
  const messageInner = messageElement.querySelector(`.${type}__inner`);

  messageBlock = messageElement;
  document.body.append(messageElement);

  const closeButton = messageBlock.querySelector(`.${type}__button`);

  const onEscapeKeydown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      doClose();
    }
  };

  const onClickOutside = (evt) => {
    if (messageInner && !messageInner.contains(evt.target)) {
      doClose();
    }
  };

  const onCloseButtonClick = () => doClose();

  function doClose() {
    document.removeEventListener('keydown', onEscapeKeydown);
    document.removeEventListener('click', onClickOutside);

    if (closeButton) {
      closeButton.removeEventListener('click', onCloseButtonClick);
    }

    if (messageBlock) {
      messageBlock.remove();
      messageBlock = null;
    }

    if (typeof onClose === 'function') {
      onClose();
    }
  }

  document.addEventListener('keydown', onEscapeKeydown);
  document.addEventListener('click', onClickOutside);

  if (closeButton) {
    closeButton.addEventListener('click', onCloseButtonClick);
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

// ---------- Открытие/закрытие формы ----------
function resetFormToInitialState() {
  currentScale = SCALE_DEFAULT;
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

  previewImage.src = DEFAULT_PREVIEW_IMAGE_SRC;

  if (pristine) {
    pristine.reset();
  }

  submitButton.disabled = false;
}

function openUploadForm() {
  uploadOverlay.classList.remove('hidden');
  document.body.classList.add('modal-open');

  document.addEventListener('keydown', onDocumentKeydown);

  currentScale = SCALE_DEFAULT;
  updateScale();

  currentEffect = 'none';
  const noneEffectRadio = uploadOverlay.querySelector('#effect-none');
  if (noneEffectRadio) {
    noneEffectRadio.checked = true;
  }

  effectLevelContainer.classList.add('hidden');
  previewImage.style.filter = 'none';

  if (pristine) {
    pristine.reset();
  }

  if (!slider) {
    initSlider();
  }
  updateSlider();
}

function closeUploadForm() {
  resetFormToInitialState();
  uploadOverlay.classList.add('hidden');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
}

// ESC: форма не должна закрываться, если открыто окно success/error
function onDocumentKeydown(evt) {
  if (evt.key !== 'Escape') {
    return;
  }

  if (uploadOverlay.classList.contains('hidden')) {
    return;
  }

  // Если открыто сообщение — ESC закрывает только сообщение, форма остаётся
  if (document.querySelector('.error') || document.querySelector('.success')) {
    return;
  }

  const isFocusedOnInput =
    document.activeElement === hashtagsInput ||
    document.activeElement === descriptionInput;

  if (!isFocusedOnInput) {
    closeUploadForm();
  }
}

// ---------- Handlers (именованные) ----------
function onUploadCancelClick(evt) {
  evt.preventDefault();
  closeUploadForm();
}

function onUploadInputChange() {
  if (!uploadInput.files || uploadInput.files.length === 0) {
    return;
  }

  const file = uploadInput.files[0];
  const reader = new FileReader();

  reader.onload = (evt) => {
    previewImage.src = evt.target.result;
    openUploadForm();
  };

  reader.readAsDataURL(file);
}

// Чтобы Escape внутри полей ввода не закрывал форму
function stopEscPropagation(evt) {
  if (evt.key === 'Escape') {
    evt.stopPropagation();
  }
}

async function onUploadFormSubmit(evt) {
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
}

// ---------- Инициализация ----------
function initUploadForm() {
  if (pristine) {
    pristine.addValidator(hashtagsInput, validateHashtags, hashtagsErrorMessage);
    pristine.addValidator(
      descriptionInput,
      validateDescription,
      `Длина комментария не может превышать ${MAX_DESCRIPTION_LENGTH} символов.`
    );
  }

  // Масштаб
  scaleSmaller.addEventListener('click', onScaleSmallerClick);
  scaleBigger.addEventListener('click', onScaleBiggerClick);

  // Эффекты
  effectsList.addEventListener('change', onEffectChange);

  // Загрузка файла и открытие формы
  uploadInput.addEventListener('change', onUploadInputChange);

  // Кнопка отмены
  uploadCancel.addEventListener('click', onUploadCancelClick);

  // Escape в инпутах
  [hashtagsInput, descriptionInput].forEach((element) => {
    element.addEventListener('keydown', stopEscPropagation);
  });

  // Отправка формы на сервер
  uploadForm.addEventListener('submit', onUploadFormSubmit);
}

export { initUploadForm, closeUploadForm };

