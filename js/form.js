const uploadForm = document.querySelector('.img-upload__form');
const uploadInput = document.querySelector('.img-upload__input');
const uploadOverlay = document.querySelector('.img-upload__overlay');
const uploadCancel = document.querySelector('.img-upload__cancel');
const hashtagsInput = uploadForm.querySelector('.text__hashtags');
const descriptionInput = uploadForm.querySelector('.text__description');
const submitButton = uploadForm.querySelector('.img-upload__submit');

// Инициализация Pristine
let pristine = null;
if (typeof Pristine !== 'undefined') {
  pristine = new Pristine(uploadForm, {
    classTo: 'img-upload__field-wrapper',
    errorTextParent: 'img-upload__field-wrapper',
    errorTextClass: 'img-upload__field-wrapper--error'
  });
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

// Функции для открытия/закрытия формы
function openUploadForm() {
  uploadOverlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);
}

function closeUploadForm() {
  uploadForm.reset();
  uploadOverlay.classList.add('hidden');
  document.body.classList.remove('modal-open');
  if (pristine) {
    pristine.reset();
  }
  submitButton.disabled = false;
}

// Обработчик клавиши Esc
function onDocumentKeydown(evt) {
  if (evt.key === 'Escape' || evt.key === 'Esc') {
    if (uploadOverlay.classList.contains('hidden')) {
      return;
    }
    closeUploadForm();
  }
}

function initUploadForm() {
  // Добавление валидаторов
  if (pristine) {
    pristine.addValidator(hashtagsInput, validateHashtags, hashtagsErrorMessage);
    pristine.addValidator(descriptionInput, validateDescription, 'Длина комментария не может превышать 140 символов.');
  }

  // Обработчики событий
  uploadInput.addEventListener('change', () => {
    if (uploadInput.files && uploadInput.files.length > 0) {
      openUploadForm();
    }
  });

  uploadCancel.addEventListener('click', (evt) => {
    evt.preventDefault();
    closeUploadForm();
  });

  document.addEventListener('keydown', onDocumentKeydown);

  // Предотвращение закрытия формы при фокусе в полях ввода
  [hashtagsInput, descriptionInput].forEach((el) => {
    el.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.stopPropagation();
      }
    });
  });

  // Обработчик отправки формы
  uploadForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    if (pristine) {
      const valid = pristine.validate();
      if (!valid) {
        return;
      }
    }

    submitButton.disabled = true;
    closeUploadForm();
  });
}

export { initUploadForm, closeUploadForm };
