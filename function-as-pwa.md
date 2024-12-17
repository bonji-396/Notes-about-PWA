# PWAとしての機能

- [インストール可能にする](#インストール可能にする)
- [オフライン操作](#オフライン操作)
- [バックグラウンド処理](#バックグラウンド処理)
   - [バックグラウンド同期](#バックグラウンド同期)
   - [バックグラウンドフェッチ](#バックグラウンドフェッチ)
   - [定期バックグラウンド同期](@定期バックグラウンド同期)
   - [プッシュ通知](#プッシュ通知)
- [権限と制限](#権限と制限)

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

1. Service Worker の導入  
サービスワーカーは、ブラウザとネットワーク間のリクエストを仲介し、必要に応じてキャッシュされたリソースを提供します。
2. Cache API の活用  
サービスワーカーがインストール時やフェッチイベント時にキャッシュを制御することで、オフライン時にもアプリの主要なリソース（HTML、CSS、JavaScript、画像など）を提供できます。
3. フェッチイベントの制御  
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

キャッシュインターフェースの実装について詳しくは、[Cache Interface](./cache-interface.md) をご参照ください。

## バックグラウンド処理
PWAのバックグラウンド処理は、アプリがフォアグラウンドにいない状態でも特定のタスクを実行可能にする機能です。この仕組みにより、ユーザーがアプリを閉じたり、デバイスをスリープ状態にしていても、データの同期やファイルのダウンロード、通知の送信などを行うことができます。

### 主な機能
- ネットワーク接続の回復をトリガーとしたデータ同期
- バックグラウンドでの大規模なデータダウンロード
- ユーザーへのリアルタイム通知

PWAにおけるバックグラウンド処理の実装には、Service Worker と以下のAPIが使用されます。
- [Background Synchronization API](./background-synchronization-api.md)
- [Background Fetch API](./background-fetch-api.md)
- [Web Periodic Background Synchronization API](./web-periodic-background-synchronization-api.md)
- [Push API]./push-api.md)

これらのAPIを活用することで、ユーザー体験を向上させ、オフライン環境や非アクティブ状態でも機能を提供できます。


## バックグラウンド同期
ネットワーク接続が回復した時に未送信のデータを同期します。ネットワーク接続が回復した際にアプリがデータ同期を実行できる仕組みです。ユーザーがオフライン時に行った操作をオンラインに戻ったときに自動的に同期します。

バックグラウンド同期の実装について詳しくは、[Background Synchronization API](./background-synchronization-api.md) をご参照ください。

### 実現できること
- メッセージアプリで、オフライン時に送信されたメッセージをバックグラウンドで送信
- フォームの入力内容を一時保存し、ネットワーク回復後に送信
- タスク管理アプリで、追加されたタスクを自動的にクラウドと同期

### 主な特徴
- ネットワーク接続回復をトリガー  
Service Worker がバックグラウンドで同期イベントを検知して処理を実行
- ユーザー操作不要  
ユーザーがアプリを再度開かなくても自動的にデータ同期が行われる

### 同期イベントの登録
サービスワーカーにタスクの実行を依頼するには、メインアプリは `navigator.serviceWorker.ready` にアクセスし、`ServiceWorkerRegistration` オブジェクトで解決します。アプリは次に、次のように `ServiceWorkerRegistration` オブジェクトの `sync.register()` を呼び出します。

#### 例) `send-message`というタスクを登録します。
このアプリはタスクの名前 "send-message" を渡しています。
```js
// main.js

async function registerSync() {
  const swRegistration = await navigator.serviceWorker.ready;
  swRegistration.sync.register("send-message");
}
```
- [`ServiceWorkerRegistration.sync`](https://developer.mozilla.org/ja/docs/Web/API/ServiceWorkerRegistration/sync):  
デバイスがネットワークに接続されたときに実行するタスクを登録するための SyncManager インターフェイスへの参照を返します。

### 同期イベントの処理
端末がネットワーク接続を保有するとすぐに、ブラウザーは必要に応じてサービスワーカーを再起動し、サービスワーカーのスコープで `sync` という名前のイベントを発生します。サービスワーカーはタスク`send-message`の名前を調べ適切な関数、この場合は `sendMessage()` を実行します。

```js
// service-worker.js
self.addEventListener("sync", (event) => {
  if (event.tag == "send-message") {
    event.waitUntil(sendMessage());
  }
});
```
- [sync イベント](https://developer.mozilla.org/ja/docs/Web/API/ServiceWorkerGlobalScope/sync_event):  
sync イベントが発生した際常に実行されるイベントハンドラーです。これは、ネットワークが利用可能になるとすぐに発生します。

`sendMessage()` 関数の結果をイベントの `waitUntil()` メソッドに渡しています。`waitUntil()` メソッドは `Promise`を引数に取り、プロミスが決定するまでサービスワーカーの停止をしないようブラウザーに要求します。 これにより、ブラウザーが処理が成功したかどうかを知ることができます。プロミスが拒否された場合、ブラウザーは `sync` イベントを再度発行して再試行します。

だだし、`waitUntil()` メソッドはブラウザーがサービスワーカーを停止させないことを保証するものではありません。処理に時間がかかりすぎる場合、サービスワーカーはいずれにせよ停止されます。この場合、処理は中止され次の`sync` イベントが発生したときにハンドラーが実行されます。

Chrome の場合、サービスワーカーは次のような場合に閉じられたと考えられます。

- 30 秒のアイドル状態が続いた場合
- 同期 JavaScript を `30 秒`間実行している場合
- `waitUntil()` に渡されたプロミスが決定するまで 5 分以上かかっている場合

## バックグラウンドフェッチ

バックグラウンドフェッチは、長時間にわたる大規模なデータ（例: 動画ファイルやアプリの更新データなど）のダウンロードをバックグラウンドで効率的に処理するための仕組みです。

### 実現できること
- 動画ストリーミングアプリでのオフライン視聴用動画のダウンロード
- ファイル管理アプリでの大規模ファイルの一括ダウンロード
- ソフトウェアのアップデートをバックグラウンドで実行

### 主な特徴
- 中断や失敗を防ぐ  
ネットワーク切断時でも、接続回復後にダウンロードが再開可能。
- 進行状況の通知  
ダウンロード状況をユーザーに通知する仕組みを提供。

....

バックグラウンドフェッチの実装について詳しくは、Background Fetch API をご参照ください。

## 定期バックグラウンド同期
定期バックグラウンド同期は、一定間隔でバックグラウンドタスクをスケジュール実行できる仕組みです。これにより、ユーザーがアプリを開いていない状態でもデータの更新を定期的に実行できます。

### 実現できること
- ニュースアプリで最新の記事を定期的にダウンロード
- 天気予報アプリで定期的に最新の気象情報を取得
- カレンダーアプリで1日ごとの新しい予定を自動同期

### 主な特徴
- スケジュールベースの同期  
タスク実行のタイミングを定期的に設定可能。
- オンライン時に自動実行  
ネットワーク接続時のみタスクが実行され、オフライン時には待機状態。

定期バックグラウンド同期の実装について詳しくは、Web Periodic Background Synchronization API をご参照ください。


....

## プッシュ通知
プッシュ通知は、サーバーからクライアントにリアルタイムで通知を送信する仕組みです。この機能により、ユーザーはアプリが開かれていない状態でも重要な更新を受け取ることができます。

### 実現できること
- メッセージアプリで新しいメッセージを通知
- Eコマースアプリでセール情報や在庫更新を通知
- SNSでの新しいコメントやフォローを通知

### 主な特徴
- サーバーからのリアルタイム通知  
アクティブなネットワーク接続があれば即時に通知を受信可能。
- バックグラウンドでの処理  
オフライン時でも通知を保存し、ネットワーク回復後に表示。

プッシュ通知の実装について詳しくは、Push API と Notifications API をご参照ください。

....

## 権限と制限
バックグラウンド処理や通知機能を利用するには、ユーザーからの許可とセキュリティ要件を満たす必要があります。これにより、不正な使用を防ぎ、安全なユーザー体験を保証します。

### 主な権限と制限
1. HTTPSが必須  
すべてのバックグラウンドAPIは、セキュアなHTTPSプロトコル環境でのみ動作します。
2. ユーザーの許可が必要  
プッシュ通知やバックグラウンド同期には、ユーザーから明示的な許可を得る必要があります。
3. ブラウザの対応状況  
一部のAPI（例: 定期バックグラウンド同期）は、まだすべてのブラウザで対応しているわけではありません。

### 実現できること
- ユーザーに通知を送る権限をリクエストし、PWAに関する信頼を確立。
- HTTPS環境で動作することで、セキュリティリスクを軽減。

....