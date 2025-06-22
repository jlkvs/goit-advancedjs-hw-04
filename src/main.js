import { fetchImages } from './js/pixabay-api.js';
import { renderGallery, clearGallery } from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');

const loadMoreBtn = document.createElement('button');
loadMoreBtn.textContent = 'Load more';
loadMoreBtn.classList.add('load-more');
loadMoreBtn.style.display = 'none'; 
gallery.after(loadMoreBtn);

const lightbox = new SimpleLightbox('.gallery a');

let currentPage = 1;
let currentQuery = '';
const perPage = 15;
let totalHits = 0;

form.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onFormSubmit(event) {
  event.preventDefault();
  const query = event.currentTarget.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.warning({
      message: 'Please enter a search query.',
      position: 'topRight',
    });
    return;
  }

  currentQuery = query;
  currentPage = 1;
  clearGallery();
  loadMoreBtn.style.display = 'none';
  showLoader();

  try {
    const data = await fetchImages(currentQuery, currentPage, perPage);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    gallery.insertAdjacentHTML('beforeend', renderGallery(data.hits));
    lightbox.refresh();

    if (totalHits > perPage) {
      loadMoreBtn.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

async function onLoadMore() {
  currentPage++;
  showLoader();
  loadMoreBtn.style.display = 'none';

  try {
    const data = await fetchImages(currentQuery, currentPage, perPage);

    gallery.insertAdjacentHTML('beforeend', renderGallery(data.hits));
    lightbox.refresh();

    const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });

    if (currentPage * perPage >= totalHits) {
      loadMoreBtn.style.display = 'none';
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      loadMoreBtn.style.display = 'block';
    }
  } catch (error) {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

function showLoader() {
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}
