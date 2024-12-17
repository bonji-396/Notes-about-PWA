# Background Synchronization API

Background Synchronization API（バックグラウンド同期 API）

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
- オフライン時のフォーム送信:  
ユーザーがオフライン時に入力したデータを保存し、オンライン時にサーバーに送信します。
- メッセージアプリ:  
メッセージ送信がオフライン時に失敗しても、接続回復後に自動的に送信します。
- データ同期:  
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
1. オフラインでのデータ保存:
データはローカルストレージや IndexedDB などに一時保存します。
2. 同期タスクの登録:
アプリがオフラインであることを検知し、SyncManager を使ってタスクを登録します。
3. sync イベントの発火:
ネットワーク接続が回復すると、ブラウザが sync イベントを発火させ、Service Worker で同期処理を実行します。
4. タスクの完了:
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

### まとめ

Background Synchronization API を利用することで、PWAはオフライン時でもユーザーの操作を保存し、ネットワークが回復した際に自動的にデータを同期することが可能になります。これにより、オフライン体験が向上し、ユーザーの手間を減らすことができます。