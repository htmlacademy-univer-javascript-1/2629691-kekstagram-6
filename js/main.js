import { generatePhotos } from './generation.js';
import { renderThumbnails } from './rendering_thumbnails.js';
import { initFullscreenView } from './fullscreen.js';

const userPhotos = generatePhotos();
const picturesContainer = document.querySelector('.pictures');
renderThumbnails(userPhotos, picturesContainer);

initFullscreenView();

export { userPhotos };
