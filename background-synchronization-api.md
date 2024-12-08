# Background Synchronization API
Background Synchronization APIは、ネットワーク接続が不安定または切断されている状況で、データの同期を保証するための機能を提供します。

## 概要

Background Synchronization API は、ネットワーク接続が回復した際にバックグラウンドでデータを同期するためのAPIです。ユーザーがオフライン状態で行った操作（例: メッセージの送信やフォームの送信）を、オンライン状態に戻ったタイミングで自動的に処理します。

このAPIは Service Worker を活用し、再接続時にタスクを確実に完了させるため、ユーザー体験を向上させる重要な機能です。

## 主な特徴
1. ネットワーク回復時に同期を実行  
ユーザーがオフライン時に行った操作を一時保存し、オンライン状態に戻った時点で自動的に同期します。
2. ユーザー操作が不要  
ユーザーがアプリを再度開かなくても、バックグラウンドで同期が実行されます。
3. Service Worker と連携  
Service Worker が sync イベントを検知し、登録された同期タスクを処理します。
4. 低バッテリー消費  
バックグラウンドで効率的に動作し、システムリソースの消費を最小限に抑えます。

## ユースケース
- オフライン時のフォーム送信  
ユーザーがオフライン時に入力したデータを保存し、オンライン時にサーバーに送信します。
- メッセージの遅延送信  
メッセージ送信がオフライン時に失敗しても、接続回復後に自動的に送信します。
- データ同期  
アプリ内で変更したデータやリソースをクラウドと同期します。

## 基本的な動作フロー
1. Service Worker に同期タスクを登録  
navigator.serviceWorker.ready を使用して同期タスクを登録します。
2. ネットワーク接続の回復  
ネットワークが回復すると、ブラウザが Service Worker に通知します。
3. sync イベントが発火  
Service Worker は sync イベントを処理し、登録されたタスクを実行します。

## 実装方法

### 1. 同期タスクの登録

navigator.serviceWorker.ready を使って同期タスクを登録します。

```js
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.register('/service-worker.js').then((registration) => {
    return registration.sync.register('sync-data');
  }).then(() => {
    console.log('バックグラウンド同期が登録されました');
  }).catch((error) => {
    console.error('同期の登録に失敗しました:', error);
  });
}
```

### 2. Service Worker で sync イベントを処理

Service Worker 側で sync イベントをリッスンし、タスクを実行します。

```js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncDataToServer());
  }
});

// 同期処理の関数
async function syncDataToServer() {
  try {
    const data = await getOfflineData(); // オフラインで保存されたデータを取得
    const response = await fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('データ同期が完了しました:', response.status);
  } catch (error) {
    console.error('データ同期中にエラーが発生しました:', error);
    throw error; // 同期失敗時に再試行される
  }
}

// オフラインデータの取得（例: IndexedDB から）
function getOfflineData() {
  return new Promise((resolve) => {
    // 例: オフラインで保存していたデータを取得する処理
    resolve({ message: 'Hello, World!' });
  });
}
```

### 動作の仕組み
1. オフラインでのデータ保存  
データはローカルストレージや IndexedDB などに一時保存します。
2. 同期タスクの登録  
アプリがオフラインであることを検知し、SyncManager を使ってタスクを登録します。
3. sync イベントの発火  
ネットワーク接続が回復すると、ブラウザが sync イベントを発火させ、Service Worker で同期処理を実行します。
4. タスクの完了  
同期処理が成功すればタスクは完了し、失敗した場合は再試行されます。

### 注意点
1. ブラウザの対応:
現在、Background Synchronization API は Chrome と Edge でサポートされています（2024年時点）。
Safari や Firefox ではまだサポートされていません。
2. HTTPS 必須:
セキュリティ上の理由から、バックグラウンド同期は HTTPS 環境でのみ動作します。
3. Service Worker 必須:
Service Worker を登録し、sync イベントをリッスンする必要があります。
4. 再試行の自動化:
同期処理が失敗した場合、ブラウザは一定の間隔で自動的に再試行を行います。

## 実装例

### main.js
```js
// IndexedDBの設定
const DB_NAME = 'syncDB';
const DB_VERSION = 1;
const STORES = {
  MESSAGES: 'pendingMessages',
  FORMS: 'pendingForms',
  UPLOADS: 'pendingUploads',
  DATA_SYNC: 'pendingDataSync'
};

// IndexedDBの初期化
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // ストアの作成
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        db.createObjectStore(STORES.MESSAGES, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORES.FORMS)) {
        db.createObjectStore(STORES.FORMS, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORES.UPLOADS)) {
        db.createObjectStore(STORES.UPLOADS, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORES.DATA_SYNC)) {
        db.createObjectStore(STORES.DATA_SYNC, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// データベースへの保存
async function saveToStore(storeName, data) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// メッセージ送信の処理
async function sendMessage(message) {
  try {
    if (navigator.onLine) {
      // オンライン時は直接送信
      await fetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify(message)
      });
    } else {
      // オフライン時は保存して同期を登録
      await saveToStore(STORES.MESSAGES, message);
      await registerSync('sync-messages');
    }
  } catch (error) {
    // エラー時は保存して同期を登録
    await saveToStore(STORES.MESSAGES, message);
    await registerSync('sync-messages');
  }
}

// フォーム送信の処理
async function submitForm(formData) {
  try {
    if (navigator.onLine) {
      await fetch('/api/forms', {
        method: 'POST',
        body: formData
      });
    } else {
      await saveToStore(STORES.FORMS, formData);
      await registerSync('sync-forms');
    }
  } catch (error) {
    await saveToStore(STORES.FORMS, formData);
    await registerSync('sync-forms');
  }
}

// ファイルアップロードの処理
async function uploadFile(file) {
  try {
    if (navigator.onLine) {
      const formData = new FormData();
      formData.append('file', file);
      await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
    } else {
      await saveToStore(STORES.UPLOADS, file);
      await registerSync('sync-uploads');
    }
  } catch (error) {
    await saveToStore(STORES.UPLOADS, file);
    await registerSync('sync-uploads');
  }
}

// データ同期の処理
async function syncData(data) {
  try {
    if (navigator.onLine) {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } else {
      await saveToStore(STORES.DATA_SYNC, data);
      await registerSync('sync-data');
    }
  } catch (error) {
    await saveToStore(STORES.DATA_SYNC, data);
    await registerSync('sync-data');
  }
}

// 同期の登録
async function registerSync(tagName) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register(tagName);
      console.log(`Sync registered: ${tagName}`);
    } catch (error) {
      console.error('Sync registration failed:', error);
    }
  } else {
    console.log('Background Sync not supported');
  }
}

// Service Workerの登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

// イベントリスナーの例
document.getElementById('messageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = {
    text: document.getElementById('messageText').value,
    timestamp: new Date().toISOString()
  };
  await sendMessage(message);
});

// オンライン/オフライン状態の監視
window.addEventListener('online', () => {
  console.log('オンラインになりました');
});

window.addEventListener('offline', () => {
  console.log('オフラインになりました');
});
```

### service-worker.js

```js
// キャッシュ名の定義
const CACHE_NAME = 'sync-cache-v1';

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(clients.claim());
});

// 同期処理
self.addEventListener('sync', (event) => {
  console.log(`Sync event received: ${event.tag}`);

  switch (event.tag) {
    case 'sync-messages':
      event.waitUntil(syncMessages());
      break;
    case 'sync-forms':
      event.waitUntil(syncForms());
      break;
    case 'sync-uploads':
      event.waitUntil(syncUploads());
      break;
    case 'sync-data':
      event.waitUntil(syncData());
      break;
  }
});

// メッセージの同期
async function syncMessages() {
  const db = await openDB();
  const messages = await getAllFromStore(db, 'pendingMessages');

  for (const message of messages) {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify(message)
      });

      if (response.ok) {
        await deleteFromStore(db, 'pendingMessages', message.id);
      }
    } catch (error) {
      console.error('Message sync failed:', error);
      throw error; // 再試行のために失敗を通知
    }
  }
}

// フォームの同期
async function syncForms() {
  const db = await openDB();
  const forms = await getAllFromStore(db, 'pendingForms');

  for (const formData of forms) {
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await deleteFromStore(db, 'pendingForms', formData.id);
      }
    } catch (error) {
      console.error('Form sync failed:', error);
      throw error;
    }
  }
}

// アップロードの同期
async function syncUploads() {
  const db = await openDB();
  const uploads = await getAllFromStore(db, 'pendingUploads');

  for (const file of uploads) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await deleteFromStore(db, 'pendingUploads', file.id);
      }
    } catch (error) {
      console.error('Upload sync failed:', error);
      throw error;
    }
  }
}

// データの同期
async function syncData() {
  const db = await openDB();
  const dataItems = await getAllFromStore(db, 'pendingDataSync');

  for (const data of dataItems) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await deleteFromStore(db, 'pendingDataSync', data.id);
      }
    } catch (error) {
      console.error('Data sync failed:', error);
      throw error;
    }
  }
}

// IndexedDBのヘルパー関数
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('syncDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function deleteFromStore(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
```

### まとめ

Background Synchronization API を利用することで、PWAはオフライン時でもユーザーの操作を保存し、ネットワークが回復した際に自動的にデータを同期することが可能になります。これにより、オフライン体験が向上し、ユーザーの手間を減らすことができます。