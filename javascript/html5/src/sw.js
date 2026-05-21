// Copyright (c) 2016,2026 Oliver Merkel. All rights reserved.
// SPDX-License-Identifier: MIT

const STATIC_CACHE = 'uisge-static-v1';
const RUNTIME_CACHE = 'uisge-runtime-v1';

const APP_SHELL = [
  './',
  './index.html',
  './css/index.css',
  './js/hmi.js',
  './js/renderer.js',
  './js/store.js',
  './js/board.js',
  './js/common.js',
  './js/controller.js',
  './js/uct/uct.js',
  './js/uct/uctnode.js',
  './manifest.json',
  './manifest.webapp',
  './manifest_hosted.webapp',
  './img/pnp-uisge_board.jpg',
  './img/oliver_ireland_pub.jpg',
  './img/icon.svg',
  './img/icons/favicon.ico',
  './img/icons/icon-bars.svg',
  './img/icons/icon-delete.svg',
  './img/icons/uisge32.png',
  './img/icons/uisge48.png',
  './img/icons/uisge60.png',
  './img/icons/uisge64.png',
  './img/icons/uisge90.png',
  './img/icons/uisge120.png',
  './img/icons/uisge128.png',
  './img/icons/uisge256.png',
  './img/icons/cc_by_nc_nd.png',
  './img/icons/cc_by_nc_sa.png',
];

const isCacheableResponse = (response) => response && response.ok && response.type !== 'opaque';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        if (isCacheableResponse(networkResponse)) {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match('./index.html')) || (await cache.match('./'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const networkResponse = await fetch(request);
      if (isCacheableResponse(networkResponse)) {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch {
      if (request.destination === 'document') {
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match('./index.html')) || (await cache.match('./'));
      }
      return new Response('Offline', {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })());
});