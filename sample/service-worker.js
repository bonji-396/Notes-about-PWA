// serviceWorker.js（Service Workerファイル）の基本構造
self.addEventListener('install', (event) => {
  // キャッシュの準備など
  console.log('Service worker self listener: installing', event);
});

self.addEventListener('activate', (event) => {
  // 古いキャッシュの削除など
  console.log('Service worker self listener: activate', event);
});

self.addEventListener('fetch', (event) => {
  // ネットワークリクエストの制御
  console.log('Service worker self listener: fetch', event);
});

self.addEventListener('push', (event) => {
  // プッシュ通知を受け取った時の制御
  console.log('Service worker self listener: push', event);
});
