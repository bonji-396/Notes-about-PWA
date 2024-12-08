# Background Fetch API

Background Fetch API は、ウェブアプリケーションがバックグラウンドで大容量のリソース（例えば動画や大量のデータ）をダウンロードする機能を提供する API です。この API を利用すると、ユーザーがアプリを閉じている間でもダウンロードが続行され、完了後に通知を送ることができます。

## 特徴
1. 長時間のダウンロードサポート  
ユーザーがブラウザを閉じたり、ネットワークが一時的に切断された場合でも、ダウンロードを続行可能
   - ブラウザやタブを閉じても処理を継続
   - ネットワーク切断時は自動で再開
   - システムの省電力モードでも動作

2. 進行状況の表示  
ダウンロードの進捗状況を通知バーやカスタム UI に表示できる
   - ダウンロードの進捗状況の取得
   - UI での進捗表示が可能
   - 一時停止と再開の制御
3. リソースの保存  
ダウンロードが完了した後、自動的にキャッシュに保存する
4. ユーザー通知  
ダウンロード完了時にプッシュ通知を送信し、ユーザーが結果を確認できる
   - ダウンロード完了時の通知
   - エラー発生時のハンドリング
   - 結果の保存と処理

## 利用例

### 主なユースケース
- 動画や音声ファイルの事前ダウンロード
- オフラインで利用するための大量のデータセットのダウンロード
- 電子書籍やレポートのダウンロード

## APIの主要メソッドとイベント

### 1. BackgroundFetchManager
ダウンロードタスクを開始します。
  
```js

const registration = await navigator.serviceWorker.ready;

const bgFetch = await registration.backgroundFetch.fetch('download-id', ['/video.mp4'], {
  title: 'Downloading Video',
  icons: [{
    src: '/icon.png',
    sizes: '192x192',
    type: 'image/png',
  }],
  downloadTotal: 50 * 1024 * 1024, // 50MB
});
```


### 2. BackgroundFetchEvent
バックグラウンドフェッチ中に発生するイベントをキャプチャします。

```js

self.addEventListener('backgroundfetchsuccess', (event) => {
  console.log('Background fetch succeeded:', event.registration.id);

  event.waitUntil(async function() {
    const cache = await caches.open('downloads');
    const records = await event.registration.matchAll();

    for (const record of records) {
      const response = await record.responseReady;
      cache.put(record.request, response);
    }
  }());
});

self.addEventListener('backgroundfetchfail', (event) => {
  console.error('Background fetch failed:', event.registration.id);
});

self.addEventListener('backgroundfetchabort', (event) => {
  console.warn('Background fetch aborted:', event.registration.id);
});
```

### 利用手順
1. フェッチの開始  
フェッチを開始する際には、backgroundFetch.fetch を使用します。
2. サービスワーカーの登録
Service Worker 内で backgroundfetchsuccess や backgroundfetchfail をリッスンします。
3. キャッシュへの保存  
フェッチが成功したらリソースをキャッシュに保存します
4. 通知の送信  
フェッチ完了後にユーザーへ通知を送信します

### 注意点
1. ブラウザのサポート
   - Background Fetch API は現在 Chrome など一部のブラウザでのみサポートされています。
   - サポート状況を確認するために Can I use を参照してください。
2. HTTPS の必須  
セキュリティ上の理由から、HTTPS 環境でのみ動作します。
3. 容量制限  
ダウンロードサイズにはブラウザやプラットフォームごとに制限がある場合があります。
4. プライバシー  
ユーザーが明示的に許可した場合にのみ利用可能です。

## 具体例: 動画のダウンロード

### フェッチ開始

```js
navigator.serviceWorker.ready.then((registration) => {
  registration.backgroundFetch.fetch('video-download', ['/video.mp4'], {
    title: 'Downloading video',
    icons: [{
      src: '/icon.png',
      sizes: '192x192',
      type: 'image/png',
    }],
    downloadTotal: 50 * 1024 * 1024, // 50MB
  });
});
```

### 成功時の処理
```js
self.addEventListener('backgroundfetchsuccess', (event) => {
  console.log('Background fetch succeeded:', event.registration.id);

  event.waitUntil(async function() {
    const cache = await caches.open('video-cache');
    const records = await event.registration.matchAll();

    for (const record of records) {
      const response = await record.responseReady;
      cache.put(record.request, response);
    }
  }());
});
```
失敗時の処理
```js
self.addEventListener('backgroundfetchfail', (event) => {
  console.error('Background fetch failed:', event.registration.id);
});
```

## 具体例: 大容量ファイルのダウンロード
### main.js
```js
// メインスクリプト
async function startBackgroundFetch() {
  const registration = await navigator.serviceWorker.ready;
  
  // バックグラウンドフェッチの開始
  const fetchId = 'large-file-download';
  const fetch = await registration.backgroundFetch.fetch(fetchId, [
    '/large-file.zip',
    '/metadata.json'
  ], {
    title: '大容量ファイルのダウンロード',
    icons: [{
      sizes: '192x192',
      src: '/icon.png',
      type: 'image/png',
    }],
    downloadTotal: 50 * 1024 * 1024, // 予想される合計サイズ（バイト）
  });

  // 進捗監視
  fetch.addEventListener('progress', () => {
    const percent = Math.round(fetch.downloaded / fetch.downloadTotal * 100);
    console.log(`ダウンロード進捗: ${percent}%`);
  });
}
```

### ServiceWorker.js
```js
// Service Worker
self.addEventListener('backgroundfetchsuccess', (event) => {
  const bgFetch = event.registration;
  
  event.waitUntil(async function() {
    // レスポンスの取得と処理
    const records = await bgFetch.matchAll();
    const promises = records.map(async (record) => {
      const response = await record.responseReady;
      const cache = await caches.open('downloads');
      await cache.put(record.request, response);
    });
    
    await Promise.all(promises);
    
    // 完了通知
    const title = '完了';
    const options = {
      body: 'ダウンロードが完了しました',
      icon: '/icon.png'
    };
    self.registration.showNotification(title, options);
  }());
});

self.addEventListener('backgroundfetchfailure', (event) => {
  console.log('ダウンロード失敗:', event);
});

self.addEventListener('backgroundfetchabort', (event) => {
  console.log('ダウンロード中止:', event);
});
```

## 具体例: 一時停止/再開機能付きのダウンロード

```js
// 進捗管理と一時停止/再開機能付きのダウンロード管理
class DownloadManager {
  constructor() {
    this.bgFetch = null;
    this.observers = new Set();
  }

  async startDownload(files, options) {
    const registration = await navigator.serviceWorker.ready;
    this.bgFetch = await registration.backgroundFetch.fetch(
      'download-' + Date.now(),
      files,
      options
    );

    this.setupEventListeners();
    return this.bgFetch;
  }

  setupEventListeners() {
    this.bgFetch.addEventListener('progress', this.onProgress.bind(this));
    this.bgFetch.addEventListener('downloadprogress', this.onDownloadProgress.bind(this));
  }

  onProgress(event) {
    const progress = {
      downloaded: this.bgFetch.downloaded,
      downloadTotal: this.bgFetch.downloadTotal,
      percent: (this.bgFetch.downloaded / this.bgFetch.downloadTotal) * 100
    };

    this.notifyObservers(progress);
  }

  onDownloadProgress(event) {
    // 個別ファイルの進捗処理
    console.log('Individual file progress:', event);
  }

  addObserver(callback) {
    this.observers.add(callback);
  }

  removeObserver(callback) {
    this.observers.delete(callback);
  }

  notifyObservers(progress) {
    this.observers.forEach(callback => callback(progress));
  }

  async pauseDownload() {
    if (this.bgFetch) {
      await this.bgFetch.abort();
    }
  }

  async resumeDownload() {
    // 中断したダウンロードの再開
    const lastProgress = await this.getLastProgress();
    return this.startDownload(this.bgFetch.requests, {
      downloadTotal: this.bgFetch.downloadTotal,
      startPosition: lastProgress
    });
  }
}
```

### ServiceWorker.js
```js
self.addEventListener('backgroundfetchfailure', async (event) => {
  const bgFetch = event.registration;
  
  // エラー情報の取得
  const records = await bgFetch.matchAll();
  const errors = await Promise.all(
    records.map(async (record) => {
      try {
        await record.responseReady;
        return null;
      } catch (error) {
        return {
          url: record.request.url,
          error: error
        };
      }
    })
  );

  // エラーの通知
  const failedDownloads = errors.filter(error => error !== null);
  if (failedDownloads.length > 0) {
    self.registration.showNotification('ダウンロードエラー', {
      body: `${failedDownloads.length}件のファイルでエラーが発生しました`,
      icon: '/icon.png'
    });
  }
});
```

## メリットとデメリット

### メリット
- 長時間のダウンロードが可能
- ユーザーがアプリを閉じても処理が継続
- ダウンロード完了時に通知を送信

### デメリット
- ブラウザの対応が限定的
- 複雑なエラーハンドリングが必要

Background Fetch API を使用することで、PWA はよりリッチでネイティブアプリに近い体験を提供できます。この API を活用して、ユーザーに利便性を高める機能を実装しましょう。