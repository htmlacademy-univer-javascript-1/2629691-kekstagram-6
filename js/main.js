import { generatePhotos } from './generation_comments.js';
import { renderThumbnails } from './thumbnails.js';
import { initFullscreenView } from './fullscreen_rendering.js';
import { initUploadForm } from './form.js';

const userPhotos = generatePhotos();
const picturesContainer = document.querySelector('.pictures');

renderThumbnails(userPhotos, picturesContainer);
initFullscreenView();
initUploadForm();

export { userPhotos };
