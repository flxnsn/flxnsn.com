/**
 * api.js
 * ------
 * Fetches portfolio data from the FastAPI backend and returns objects
 * that are drop-in replacements for the original hard-coded JS arrays.
 *
 * Usage:
 *   import { getDesignProjects, getItProjects, getPhotos } from './api.js';
 *
 *   const designProjects = await getDesignProjects();
 *   const itProjects     = await getItProjects();
 *   const photos         = await getPhotos();
 */

const BASE_URL = 'http://localhost:8000';

// util

async function fetchJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

// design

/**
 * Returns the same shape as the original `designProjects` array:
 * [{ id, title, tags: string[], desc, images: string[] }, ...]
 */
export async function getDesignProjects() {
  const raw = await fetchJSON('/design');
  return raw.map(p => ({
    id:     p.id,
    title:  p.title,
    desc:   p.desc,
    tags:   p.tags.map(t => t.value),
    images: p.images.map(i => i.url),
  }));
}

export async function getDesignProject(id) {
  const p = await fetchJSON(`/design/${id}`);
  return {
    id:     p.id,
    title:  p.title,
    desc:   p.desc,
    tags:   p.tags.map(t => t.value),
    images: p.images.map(i => i.url),
  };
}

// IT

/**
 * Returns the same shape as the original `itProjects` array:
 * [{ id, title, tags: string[], desc: string[], image: {src,alt}|null }, ...]
 */
export async function getItProjects() {
  const raw = await fetchJSON('/it');
  return raw.map(normaliseItProject);
}

export async function getItProject(id) {
  const p = await fetchJSON(`/it/${id}`);
  return normaliseItProject(p);
}

function normaliseItProject(p) {
  // Restore paragraphs in original order
  const desc = [...p.descs]
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map(d => d.text);

  const image = p.image_src
    ? { src: p.image_src, alt: p.image_alt }
    : null;

  return {
    id:    p.id,
    title: p.title,
    tags:  p.tags.map(t => t.value),
    desc,
    image,
  };
}

// photography

/**
 * Returns the same shape as the original `photos` array:
 * [{ id, src, title, desc }, ...]
 */
export async function getPhotos() {
  return fetchJSON('/photos');
}

export async function getPhoto(id) {
  return fetchJSON(`/photos/${id}`);
}

// all data

/**
 * Fetches all three collections concurrently.
 * Returns { designProjects, itProjects, photos } — same names as the original file.
 */
export async function loadAllData() {
  const [designProjects, itProjects, photos] = await Promise.all([
    getDesignProjects(),
    getItProjects(),
    getPhotos(),
  ]);
  return { designProjects, itProjects, photos };
}
