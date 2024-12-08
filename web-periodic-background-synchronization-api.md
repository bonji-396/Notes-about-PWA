# Web Periodic Background Synchronization API

Web Periodic Background Synchronization API は、PWA（Progressive Web Apps）が一定間隔でバックグラウンドでデータを同期できる機能を提供する API です。ユーザーがアプリを開く前に最新のコンテンツを準備することができます。



## 特徴
1. 定期的なデータ更新  
サーバーとのデータ同期やキャッシュの更新をバックグラウンドで定期的に実行可能。
2. 効率的なリソース利用  
システムやブラウザがアイドル状態のときにタスクを実行し、リソース効率を向上。
3. ユーザー体験の向上  
ユーザーがアプリを開いたときに最新のデータが即座に利用可能。

## ユースケース
- ニュースアプリの定期的な記事の更新。
- 天気予報アプリのバックグラウンドデータ取得。
- ソーシャルメディアアプリの通知データの同期。
- ストックマーケットアプリの価格データ更新。

## APIの動作概要
1. ユーザーの許可が必要  
この API を利用するには、ユーザーの明示的な許可が必要です。
2. Service Worker を利用  
タスクの登録や実行は Service Worker を通じて行われます。
3. ブラウザの管理  
タスクの頻度や実行タイミングはブラウザによって制御され、開発者は直接制御できません。

## 基本的なAPI構成

### 1. タスクの登録

アプリケーションのメインスクリプト内でタスクを登録します。
タスクは navigator.periodicSync.register メソッドで登録します。

#### main.js
```js
if ('periodicSync' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.periodicSync.register('news-update', {
      minInterval: 24 * 60 * 60 * 1000, // 最小間隔: 1日（ミリ秒単位）
    }).then(() => {
      console.log('Periodic sync registered!');
    }).catch((error) => {
      console.error('Failed to register periodic sync:', error);
    });
  });
}
```

### 2. Service Worker イベント

登録されたタスクが実行されると、`periodicsync` イベントが Service Worker 内で発火します。Service Worker で `periodicsync` イベントを処理します。

#### serviceWorker.js

```js
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'news-update') {
    event.waitUntil(
      fetch('/api/news/latest')
        .then((response) => response.json())
        .then((news) => {
          return caches.open('news-cache').then((cache) => {
            cache.put('/news', new Response(JSON.stringify(news)));
          });
        })
        .catch((error) => {
          console.error('Failed to fetch and cache news:', error);
        })
    );
  }
});
```

## 利用時のベストプラクティス
1. データの効率的な取得  
必要最小限のデータを取得し、ネットワーク負荷を軽減します。
2. タスクの適切な命名  
各タスクに一意の tag を付与し、複数の同期タスクを整理します。
3. エラー処理の実装  
フェッチエラーやキャッシュエラーに適切に対応し、ユーザー体験を損なわないようにします。
4. フォールバック対応  
ブラウザがこの API をサポートしていない場合に代替機能を提供します。

## メリットとデメリット

### メリット
- 最新データを維持することでユーザー体験を向上
- バッテリーやリソースの効率的な利用
- ユーザーがアプリを開いていない間でもデータ同期が可能

### デメリット
- ブラウザのサポートが限定的
- 同期頻度がブラウザに依存するため、開発者が完全に制御できない
- HTTPS 環境でのみ動作

## 基本的な実装例
### main.js

```js
// メインスクリプト: periodic-sync登録
async function registerPeriodicSync() {
  try {
    // Service Workerの登録確認
    const registration = await navigator.serviceWorker.ready;

    // Periodic Sync APIのサポートチェック
    if ('periodicSync' in registration) {
      // 権限の確認
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync',
      });

      if (status.state === 'granted') {
        // 1日1回の同期を登録
        await registration.periodicSync.register('content-sync', {
          minInterval: 24 * 60 * 60 * 1000, // 24時間
        });
        console.log('Periodic sync registered!');
      }
    }
  } catch (error) {
    console.error('Periodic sync registration failed:', error);
  }
}
```

### serviceWorker.js
```js
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    // 新しいコンテンツの取得
    const response = await fetch('/api/content');
    const content = await response.json();

    // キャッシュの更新
    const cache = await caches.open('content-cache');
    await cache.put('/api/content', new Response(JSON.stringify(content)));

    // 必要に応じて通知
    await self.registration.showNotification('更新完了', {
      body: '新しいコンテンツが利用可能です',
      icon: '/icon.png'
    });
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
```

## 高度な実装例
### main.js
```js
// 複数の同期タスクの管理
class PeriodicSyncManager {
  constructor() {
    this.tasks = new Map();
  }

  async registerTask(tag, options) {
    const registration = await navigator.serviceWorker.ready;
    
    if (!('periodicSync' in registration)) {
      throw new Error('Periodic Sync not supported');
    }

    const permission = await this.checkPermission();
    if (permission !== 'granted') {
      throw new Error('Permission not granted');
    }

    try {
      await registration.periodicSync.register(tag, {
        minInterval: options.interval || 24 * 60 * 60 * 1000,
        networkState: options.networkState || 'any'
      });

      this.tasks.set(tag, {
        lastSync: Date.now(),
        options: options
      });

      return true;
    } catch (error) {
      console.error(`Failed to register ${tag}:`, error);
      return false;
    }
  }

  async checkPermission() {
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync',
    });
    return status.state;
  }

  async getRegisteredTasks() {
    const registration = await navigator.serviceWorker.ready;
    const tags = await registration.periodicSync.getTags();
    return tags;
  }

  async unregisterTask(tag) {
    const registration = await navigator.serviceWorker.ready;
    await registration.periodicSync.unregister(tag);
    this.tasks.delete(tag);
  }
}
```

### serviceWorker.js
```js
// 複数のタスクに対応したService Worker
const syncHandlers = {
  'content-sync': async () => {
    // コンテンツの同期
    await syncContent();
  },
  'feed-sync': async () => {
    // フィードの更新
    await syncFeed();
  },
  'notification-sync': async () => {
    // 通知の確認
    await checkNotifications();
  }
};

self.addEventListener('periodicsync', event => {
  const handler = syncHandlers[event.tag];
  if (handler) {
    event.waitUntil(handler());
  }
});
```


## 注意点
1. ブラウザのサポート
  - 現時点では、対応ブラウザが限定されています（Chrome の一部バージョンなど）。サポート状況は Can I use を参照してください。
  - コードでの確認
    ```js
    async function checkSupport() {
      // APIのサポートチェック
      if (!('serviceWorker' in navigator)) {
        return { supported: false, reason: 'Service Worker not supported' };
      }

      const registration = await navigator.serviceWorker.ready;
      if (!('periodicSync' in registration)) {
        return { supported: false, reason: 'Periodic Sync not supported' };
      }
      
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync',
      });

      return {
        supported: true,
        permissionStatus: status.state
      };
    }
    ```
2. 頻度の制限  
実行頻度はブラウザによって制御され、設定した間隔が常に保証されるわけではありません。
3. HTTPS の必須  
セキュリティ上の理由から、HTTPS 環境でのみ動作します。
4. ユーザーの許可  
ユーザーがバックグラウンド同期の許可を拒否した場合、この API は動作しません。
5. バッテリーとネットワークの考慮
    ```js
    // 最適な同期条件の設定
    async function registerOptimizedSync() {
      const options = {
        interval: 24 * 60 * 60 * 1000,  // 24時間
        networkState: 'wifi-only',       // WiFi接続時のみ
        batteryStatus: {
          threshold: 0.2,                // バッテリー20%以上
          charging: true                 // 充電中のみ
        }
      };

      await registerPeriodicSync('content-sync', options);
    }
     ```
6. エラーハンドリングと再試行
    ```js
    async function syncWithRetry(tag, maxRetries = 3) {
      let retries = 0;

      while (retries < maxRetries) {
        try {
          await performSync(tag);
          break;
        } catch (error) {
          retries++;
          console.log(`Sync attempt ${retries} failed:`, error);
          
          if (retries === maxRetries) {
            throw new Error(`Sync failed after ${maxRetries} attempts`);
          }

          // 指数バックオフ
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, retries) * 1000)
          );
        }
      }
    }
    ```

7. パフォーマンスとリソース管理
    ```js
    // リソース使用量の最適化
    async function optimizedSync() {
      // ネットワーク状態の確認
      const connection = navigator.connection;
      if (connection && 
          (connection.type === 'cellular' || connection.saveData)) {
        // データ節約モードの場合は最小限の同期
        await performLightSync();
      } else {
        // 通常の同期
        await performFullSync();
      }
    }
    ```

## まとめ

Web Periodic Background Synchronization API を使用すると、ユーザー体験を向上させる高度なデータ同期機能を実現できます。ただし、対応ブラウザの制限や実行タイミングの制御に注意し、他の API と組み合わせて柔軟に対応することが重要です。