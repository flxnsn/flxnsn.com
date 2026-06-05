/**
 * api.js
 * ------
 * Fetches portfolio data from the PHP backend and returns objects
 * that are drop-in replacements for the original hard-coded JS arrays.
 *
 * Usage:
 *   import { getDesignProjects, getItProjects, getPhotos } from './api.js';
 *
 *   const designProjects = await getDesignProjects();
 *   const itProjects     = await getItProjects();
 *   const photos         = await getPhotos();
 */

const BASE_URL = '../api.php';   // same server — relative path, no CORS needed

// util

async function fetchJSON(route, id = null) {
  const url = id ? `${BASE_URL}?r=${route}&id=${id}` : `${BASE_URL}?r=${route}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status} on ${route}`);
  return res.json();
}

async function mutate(route, method, body, id = null) {
  const url = id ? `${BASE_URL}?r=${route}&id=${id}` : `${BASE_URL}?r=${route}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (method === 'DELETE') return res;
  return res.json();
}

async function uploadImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE_URL}?r=upload-image`, { method: 'POST', body: fd });
  return res.json();
}

// design

/**
 * Returns the same shape as the original `designProjects` array:
 * [{ id, title, tags: string[], desc, images: string[] }, ...]
 */
export async function getDesignProjects() {
  const raw = await fetchJSON('design');
  return raw.map(normaliseDesign);
}

export async function getDesignProject(id) {
  return normaliseDesign(await fetchJSON('design', id));
}

function normaliseDesign(p) {
  return {
    id:     p.id,
    title:  p.title,
    desc:   p.desc,
    tags:   p.tags.map(t => t.value ?? t),
    images: p.images.map(i => i.url ?? i),
  };
}

// IT

/**
 * Returns the same shape as the original `itProjects` array:
 * [{ id, title, tags: string[], desc: string[], image: {src,alt}|null }, ...]
 */
export async function getItProjects() {
  const raw = await fetchJSON('it');
  return raw.map(normaliseItProject);
}

export async function getItProject(id) {
  return normaliseItProject(await fetchJSON('it', id));
}

function normaliseItProject(p) {
  const desc = [...(p.descs ?? [])]
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map(d => d.text ?? d);

  const image = p.image_src ? { src: p.image_src, alt: p.image_alt } : null;

  return {
    id:    p.id,
    title: p.title,
    tags:  p.tags.map(t => t.value ?? t),
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
  return fetchJSON('photos');
}

export async function getPhoto(id) {
  return fetchJSON('photos', id);
}

// all data

/**
 * Fetches all three collections concurrently.
 * Returns { designProjects, itProjects, photos }
 */
export async function loadAllData() {
  const [designProjects, itProjects, photos] = await Promise.all([
    getDesignProjects(),
    getItProjects(),
    getPhotos(),
  ]);
  return { designProjects, itProjects, photos };
}

// admin CRUD — used by Admin.jsx

export const adminApi = {
  get:    (route, id = null)       => fetchJSON(route, id),
  post:   (route, body)            => mutate(route, 'POST',   body),
  put:    (route, id, body)        => mutate(route, 'PUT',    body, id),
  delete: (route, id)              => mutate(route, 'DELETE', null, id),
  upload: uploadImage,
  seed:        ()  => fetch(`${BASE_URL}?r=seed`,       { method: 'POST' }).then(r => r.json()),
  seedReset:   ()  => fetch(`${BASE_URL}?r=seed-reset`, { method: 'POST' }).then(r => r.json()),
};
