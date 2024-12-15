# PWAとしての機能

## インストール可能にする
PWA としての機能の一つとして、「プラットフォーム専用のアプリのように端末にインストールできること」があります。
PWA を端末にインストール可能にするためには、以下の要件を満たす必要があります。

PWA のインストールは、ユーザーの端末にアプリケーションを統合し、ネイティブアプリに近い体験を提供するための重要なステップです。これにより、ユーザーはアプリをより頻繁に利用しやすくなり、リテンション率の向上が期待されます。

### 1. HTTPS環境で提供

PWA がインストール可能であるためには、アプリが HTTPS プロトコルを使用して提供される必要があります。これにより、安全な接続が保証されます。

> [!NOTE]
> ローカル開発の場合  
> localhost または 127.0.0.1 を利用した環境でもテストが可能です。

### 2. Manifest ファイルの設定

manifest.json ファイルは、PWA がインストール可能であるために必要な基本情報をブラウザに提供します。このファイルには、アプリ名、アイコン、スタートURL、テーマカラーなどが定義されている必要があります。

#### 必須のプロパティ
- name または short_name（アプリ名）
- icons（192px および 512px のアイコン）
- start_url（アプリのエントリーポイント）
- display（standalone または fullscreen 推奨）

詳しい設定方法については [Web App Manifest](./manifest.md) をご参照ください。

### 3. Service Worker の導入

PWA がインストール可能であるためには、Service Worker を利用してキャッシュ管理やオフライン機能を実装する必要があります。これにより、ブラウザがアプリを「インストール可能」と認識します。

#### 基本的な要件
- アクティブな Service Worker が登録されていること
- キャッシュやフェッチイベントでのネットワーク管理が適切に実装されていること

### 4. ブラウザのインストール要件

ブラウザは、以下の条件を満たしている場合に PWA のインストールプロンプトを表示します。

#### Chromeの場合
- HTTPS 環境で提供されている。
- Manifest ファイルが正しく設定されている。
- Service Worker が登録され、少なくとも1つのリソースをキャッシュしている。

> [!CAUTION]
> Apple の Safari では、PWA のインストール体験が他のブラウザと異なり、ホーム画面に追加するための専用プロンプトはありません。

### PWAのインストール体験

インストール可能な PWA は、ブラウザが以下のような方法でユーザーに通知します

1. インストールプロンプト  
対応ブラウザでは、インストール可能な条件が満たされると「ホーム画面に追加」などのプロンプトが表示されます。
2. メニューバーからの追加  
一部のブラウザでは、メニューから「アプリをインストール」を選択することができます。
3. アプリストアでの公開  
Google Play や Microsoft Store など、主要プラットフォームのアプリストアで公開し、インストール可能にすることもできます。アプリストアでの公開には追加の要件があるため、それぞれのプラットフォームのガイドラインを確認してください。

- [Google Play ストアでの公開ガイドライン](https://chromeos.dev/en/publish/pwa-in-play)
- [Microsoft ストアでの公開ガイドライン](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/microsoft-store)


## オフライン操作

PWAの大きな特徴の一つは、ネットワーク接続がない場合でもアプリを操作できる点です。これにより、ユーザーはオフライン時でも必要な機能を利用し続けることができます。この仕組みは、主に Service Worker を用いて実現されます。

オフライン操作を実現することで、PWAはユーザー体験を大幅に向上させることができます。この仕組みを構築する際には、キャッシュ戦略の選択とリソース管理が成功の鍵となります。


### オフライン操作の基本原理

1.	Service Worker の導入  
サービスワーカーは、ブラウザとネットワーク間のリクエストを仲介し、必要に応じてキャッシュされたリソースを提供します。
2.	Cache API の活用  
サービスワーカーがインストール時やフェッチイベント時にキャッシュを制御することで、オフライン時にもアプリの主要なリソース（HTML、CSS、JavaScript、画像など）を提供できます。
3.	フェッチイベントの制御  
サービスワーカーは fetch イベントをインターセプトし、ネットワークが利用可能な場合はリクエストを通し、利用不可の場合はキャッシュからレスポンスを提供します。


### 1. 基本的なキャッシュ設定

サービスワーカーがインストールされた際に、静的リソースをキャッシュします。

#### Service Worker
```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('pwa-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/icon.png',
      ]);
    })
  );
});
```

### 2. フェッチイベントの制御

リソースへのリクエストをインターセプトし、キャッシュを優先的に利用します。

#### Service Worker
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // キャッシュがあれば返し、なければネットワークから取得
      return cachedResponse || fetch(event.request);
    })
  );
});
```

### 3. オフライン時のフォールバックページ

オフライン時に指定したフォールバックページを返す例。

#### Service Worker
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => caches.match('/offline.html'))
      );
    })
  );
});
```

### キャッシュ戦略

オフライン操作を実現するために、いくつかのキャッシュ戦略が利用されます。

|戦略|説明|
|---|---|
|Cache First|リソースがキャッシュに存在する場合それを利用し、存在しない場合はネットワークから取得します。|
|Network First|ネットワーク接続がある場合はネットワークから取得し、失敗した場合にキャッシュを利用します。|
|Stale While Revalidate|キャッシュされたリソースを即座に返し、バックグラウンドでネットワークリクエストを行いキャッシュを更新します。|
|Offline Fallback|ネットワーク接続が失敗した場合に、事前にキャッシュされたフォールバックリソースを提供します。|

### オフライン状態の検知と対応
オフラインの状態によって、キャッシュ戦略を切り分ける方法もありだと思います。

```js
// 現在の接続状態を確認
console.log(navigator.onLine ? "オンライン" : "オフライン");

// メインスクリプトでのオフライン検知
window.addEventListener('online', () => {
  console.log('ネットワーク接続が回復しました');
  // オンライン時の処理
});

window.addEventListener('offline', () => {
  console.log('ネットワーク接続が切断されました');
  // オフライン時の処理
});
```
#### オンライン時に「Network First」、オフライン時に「Cache First」
以下は、オンライン時に「Network First」、オフライン時に「Cache First」戦略を使用する例です。

```js
// Service Worker
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      if (navigator.onLine) {
        // オンライン時: ネットワーク優先
        try {
          const networkResponse = await fetch(event.request);
          const cache = await caches.open("dynamic-cache-v1");
          // キャッシュを更新
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.error("ネットワークエラー:", error);
          return caches.match(event.request);
        }
      } else {
        // オフライン時: キャッシュ優先
        return caches.match(event.request) || fetch(event.request);
      }
    })()
  );
});
```

#### 高度なキャッシュ戦略の例
- オンライン時  
キャッシュから即座にリソースを返しつつ、バックグラウンドでネットワークからリソースを取得してキャッシュを更新します。
- オフライン時  
キャッシュが利用できない場合、フォールバックリソースを提供します。

```js
// Service Worker
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open("dynamic-cache-v1");
      const cachedResponse = await cache.match(event.request);

      if (navigator.onLine) {
        // オンライン時
        const networkResponse = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cachedResponse || networkResponse;
      } else {
        // オフライン時
        return cachedResponse || caches.match("/offline.html");
      }
    })()
  );
});
```

### オフライン対応での注意点
1. キャッシュの管理  
   - 古いキャッシュの削除や更新戦略を明確に設計します。
   - キャッシュ名にバージョン番号を含めると、簡単に管理できます。
2. リソースサイズの最適化  
   - キャッシュするリソースが大きすぎると、ストレージの制限に達する可能性があります。
3. フォールバックページの準備
   - オフライン時にユーザーに適切な情報を提供するフォールバックページを設計することで、使いやすさを向上させます。
4. 動的データの扱い
   - 動的なコンテンツ（APIレスポンスなど）をキャッシュする場合、適切な有効期限や更新タイミングを設ける必要があります。

### 具体的なユースケース
- ニュースアプリ  
最新の記事をオンライン時にキャッシュし、オフライン時にも閲覧可能にします。
- タスク管理アプリ  
ユーザーがオフラインでタスクを追加・編集し、オンラインに戻った際に同期します。
- Eコマースアプリ  
商品リストやカテゴリ情報を事前にキャッシュし、オフラインでも閲覧できるようにします。



## バックグラウンド処理