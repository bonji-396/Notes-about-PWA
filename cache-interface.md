# Cache Interface
Cache APIは、リクエストとレスポンスのペアを保存するためのストレージメカニズムを提供します。主にService Workerと組み合わせて使用され、オフラインでのリソース提供を可能にします。

## 概要

Cache インターフェースは、Service Worker で使用される Cache API の一部であり、リソース（HTML、CSS、JS、画像、APIレスポンスなど）をキャッシュする仕組みを提供します。オフライン対応やパフォーマンス向上を目的として、Web アプリケーションのリソースをブラウザ上のキャッシュストレージに保存・取得するために使用します。

Cache API は主に Service Worker 内で利用されますが、メインスレッドの JavaScript からもアクセス可能です。

## 主な特徴
1. リソースの保存  
ネットワークから取得したリソースや API レスポンスをキャッシュストレージに保存します。
2. オフライン対応  
オフライン時には、キャッシュされたリソースを利用して Web アプリケーションを動作させます。
3. 柔軟な制御  
キャッシュに保存するリソースや取得するタイミング、更新の戦略を柔軟に制御できます。
4. 非同期設計  
Cache API はすべての操作が Promise ベースで非同期的に設計されています。

## Cache インターフェースの主なメソッド

Cache インターフェースには、キャッシュを操作するためのメソッドが用意されています。

|メソッド|説明|
|---|---|
|[add(request)](https://developer.mozilla.org/ja/docs/Web/API/Cache/add)|指定したリソースをフェッチしてキャッシュに追加します。
|[addAll(requests)](https://developer.mozilla.org/ja/docs/Web/API/Cache/addAll)|複数のリソースを一括でフェッチしてキャッシュに追加します。
|[match(request)](https://developer.mozilla.org/ja/docs/Web/API/Cache/match)|キャッシュ内のリソースを検索し、見つかった場合は返します。
|[matchAll(request)](https://developer.mozilla.org/ja/docs/Web/API/Cache/matchAll)|キャッシュ内のすべての一致するリソースを返します。
|[put(request, response)](https://developer.mozilla.org/ja/docs/Web/API/Cache/put)|指定したリクエストとレスポンスをキャッシュに追加します（手動でキャッシュを更新する場合に使用）。
|[delete(request)](https://developer.mozilla.org/ja/docs/Web/API/Cache/delete)|指定したリソースをキャッシュから削除します。
|[keys()](https://developer.mozilla.org/ja/docs/Web/API/Cache/keys)|キャッシュ内のすべてのリクエストを返します。|

## 基本的な使い方

### 1. キャッシュへのリソース追加

- 単一リソースを追加する (add)
  ```js
  caches.open('my-cache-v1').then((cache) => {
    cache.add('/index.html'); // URLをフェッチしてキャッシュに保存
  });
  ```

- 複数のリソースを追加する (addAll)
  ```js
  caches.open('my-cache-v1').then((cache) => {
    cache.addAll([
      '/',
      '/index.html',
      '/styles/main.css',
      '/scripts/app.js',
      '/images/logo.png'
    ]);
  });
  ```

### 2. キャッシュからリソースを取得する

リソースを検索する (match)

```js
caches.open('my-cache-v1').then((cache) => {
  cache.match('/index.html').then((response) => {
    if (response) {
      console.log('キャッシュから取得:', response);
    } else {
      console.log('キャッシュにリソースが存在しません');
    }
  });
});
```

### 3. キャッシュへの手動追加 (put)

put メソッドは、フェッチしたレスポンスや手動で生成したレスポンスをキャッシュに保存する場合に使います。

```js
fetch('/data.json').then((response) => {
  return caches.open('my-cache-v1').then((cache) => {
    cache.put('/data.json', response.clone()); // レスポンスをキャッシュに保存
  });
});
```

### 4. キャッシュからリソースを削除する

指定したリソースを削除 (delete)

```js
caches.open('my-cache-v1').then((cache) => {
  cache.delete('/styles/main.css').then((success) => {
    console.log(success ? '削除成功' : '削除失敗');
  });
});
```

### 5. キャッシュ内のすべてのリクエストを取得

```js
caches.open('my-cache-v1').then((cache) => {
  cache.keys().then((requests) => {
    requests.forEach((request) => {
      console.log('キャッシュ内のリソース:', request.url);
    });
  });
});
```

### バージョン管理付きキャッシュ

```js
const CACHE_VERSION = 'v1';
const CACHE_NAME = `my-app-${CACHE_VERSION}`;

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('my-app-'))
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
```

### 条件付きキャッシュ
```js
cache.match(request, {
  ignoreSearch: true,     // URLのクエリパラメータを無視
  ignoreMethod: false,    // HTTPメソッドを考慮
  ignoreVary: false       // Varyヘッダーを考慮
});
```

### キャッシュの列挙
```js
caches.keys().then(cacheNames => {
  cacheNames.forEach(name => {
    console.log('Found cache:', name);
  });
});
```

### レスポンスのクローン
```js
fetch(request)
  .then(response => {
    // レスポンスをクローンしてキャッシュに保存
    cache.put(request, response.clone());
    return response;
  });
```

### カスタムレスポンスの作成
```js
cache.put(request, new Response('Custom response', {
  status: 200,
  headers: new Headers({
    'Content-Type': 'text/plain'
  })
}));
```

### 条件付きキャッシュ更新
```js
cache.match(request).then(response => {
  if (!response || response.status !== 200 || 
      response.headers.get('date') < oneWeekAgo) {
    // キャッシュの更新が必要
    return updateCache(request);
  }
  return response;
});
```

## エラーハンドリング

### 基本的なエラー処理
```js
cache.match(request)
  .then(response => {
    if (!response) {
      throw new Error('No cache found');
    }
    return response;
  })
  .catch(error => {
    console.error('Cache error:', error);
    return fetch(request);
  });
```

### 高度なエラー処理
```js
async function handleCacheOperation(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(request);
    
    if (!response) {
      // キャッシュミスの処理
      return await fetchAndCache(request);
    }
    
    return response;
  } catch (error) {
    // エラーログの記録
    console.error('Cache operation failed:', error);
    
    // フォールバックレスポンスの提供
    return new Response('Error occurred', {
      status: 500,
      statusText: 'Cache operation failed'
    });
  }
}
```


## 実際のユースケース

Service Worker でのキャッシュ利用

Service Worker で Cache API を利用することで、オフライン対応やパフォーマンス最適化を実現します。

1. Service Worker 内のインストールイベントでキャッシュを準備
    ```js
    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open('my-cache-v1').then((cache) => {
          return cache.addAll([
            '/',
            '/index.html',
            '/styles.css',
            '/app.js',
            '/logo.png'
          ]);
        })
      );
    });
    ```
2. フェッチイベントでキャッシュを利用
    ```js
    self.addEventListener('fetch', (event) => {
      event.respondWith(
        caches.match(event.request).then((response) => {
          // キャッシュがあれば返し、なければネットワークから取得
          return response || fetch(event.request).then((networkResponse) => {
            return caches.open('my-cache-v1').then((cache) => {
              cache.put(event.request, networkResponse.clone()); // キャッシュに保存
              return networkResponse;
            });
          });
        })
      );
    });
    ```

## キャッシュ戦略とパターン

### 1. Cache First（キャッシュ優先）

キャッシュ内にリソースが存在すればそれを返し、存在しない場合はネットワークから取得します。

### 2. Network First（ネットワーク優先）

ネットワークからリソースを取得し、失敗した場合はキャッシュを利用します。

### 3. Stale While Revalidate

キャッシュされたリソースを即座に返し、バックグラウンドでネットワークから取得してキャッシュを更新します。

## 注意点
1. HTTPS 必須:  
Cache API は HTTPS 環境でのみ動作します（localhost を除く）。
2. ストレージ制限:  
ブラウザごとにキャッシュの最大容量が制限されており、容量を超えると古いキャッシュが自動的に削除されることがあります。
3. バージョン管理:  
キャッシュのバージョン管理（my-cache-v1, my-cache-v2 など）や、古いキャッシュの削除タイミングなど、適切に設計する必要があります。

## まとめ

Cache インターフェースを使用することで、PWA やオフライン対応アプリケーションのリソース管理を柔軟に実装できます。Service Worker と組み合わせることで、ネットワークエラーの軽減や高速なリソース読み込み、オフラインサポートが実現可能です。