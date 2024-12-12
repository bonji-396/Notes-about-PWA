# Web Worker

WebWorkerは、JavaScriptでバックグラウンド処理を実現するための仕組みです。
Webブラウザでバックグラウンドスレッドを使用して非同期処理を実行するためのAPIです。
これにより、メインスレッド（UIスレッド）をブロックすることなく、重い計算やI/O操作を実行できます。

通常、JavaScriptはシングルスレッドで動作するため、重い処理を行うとUIがフリーズすることがありますが、Web Workerを利用すると、これを回避できます。


## 主な特徴と利点
### メインスレッドとの分離
- メインスレッド（UIスレッド）とは別のスレッドで処理を実行できます
- UIのブロッキングを防ぎ、アプリケーションの応答性を維持できます

### スレッド間通信
- メインスレッドとWeb Workerは`postMessage`と`onmessage`を介して通信します。
- 通信には文字列やシリアライズ可能なオブジェクトが使用されます。

## 制限事項
- DOMへのアクセス不可
- windowやdocumentオブジェクトにはアクセスできない
- 同一オリジンポリシーの制約

## 主な用途
- 大量のデータ処理
- 複雑な計算処理
- 長時間かかる処理
- 画像処理
- データの圧縮・展開処理


##  基本的な使い方

```js
// メインスクリプト
const worker = new Worker('worker.js');

// データをWorkerに送信
worker.postMessage({data: 'some data'});

// Workerからの結果を受け取る
worker.onmessage = function(e) {
    console.log('Worker からの結果:', e.data);
};

// エラーハンドリング
worker.onerror = function(error) {
    console.error('Worker エラー:', error);
};
```

```js
// worker.js
self.onmessage = function(e) {
    // メインスクリプトから受け取ったデータを処理
    const result = processData(e.data);
    
    // 結果をメインスクリプトに送り返す
    self.postMessage(result);
};
```

## メリット

### 1. パフォーマンスの向上
- メインスレッドをブロックせずに重い処理を実行可能
- UIの応答性が維持される
- マルチコアプロセッサを効率的に活用できる

### 2. バックグラウンド処理
- データの処理や計算をバックグラウンドで実行
- ユーザー体験を損なわずに複雑な処理を実行可能

### 3. リソース分離
- メインスレッドとメモリ空間が分離されているため、クラッシュの影響を局所化
- メモリリークのリスクを軽減

## デメリット

### 1. リソースのオーバーヘッド
- 各Workerは独自のメモリ空間を必要とする
- 多数のWorkerを作成すると、メモリ消費が増加

### 2. 通信コスト
- メインスレッドとWorker間のデータ通信にコストが発生
- 大量のデータを送受信する場合、シリアライズ/デシリアライズのオーバーヘッドが発生

### 3. 機能の制限
- DOMにアクセスできない
- windowオブジェクトの多くの機能が使用不可
- localStorage等の一部のAPIにアクセスできない

### 4. デバッグの複雑さ
- マルチスレッド環境特有のデバッグの難しさ
- タイミング依存のバグが発生する可能性

### 5. ブラウザサポートの考慮
- 古いブラウザでは対応していない場合がある
- フォールバック処理の実装が必要になる場合がある

## WebWorkerの使用を検討する際のポイント

- 処理の性質（CPU負荷の高い処理か）
- データの転送量
- メモリ使用量
- ブラウザのサポート状況
- デバッグのしやすさ

これらを総合的に判断し、アプリケーションに適した実装方法を選択することが重要です。

## WebWorkerを使用する際のベストプラクティス
- 重い処理の実行時のみWorkerを使用
- 適切なエラーハンドリングの実装
- 必要に応じてWorkerプールの活用
- メモリ管理への注意（終了時のterminateの呼び出し）

## Web Workerの種類

Web Workerには主に3つの種類があります。

1. Dedicated Worker（専用ワーカー）
   - 一つのメインスレッドに対して専用で動作するWeb Worker
   - 最も一般的な形態
2. Shared Worker（共有ワーカー）
   - 複数のメインスレッドから共有されるWeb Worker
   - 複数のブラウザコンテキスト（例えばタブ）間でデータ共有が可能
3. Service Worker
   - PWA（プログレッシブウェブアプリ）などで使用される特殊なWorker
   - ネットワークリクエストをキャッシュしたり、オフライン対応を強化したりするために使用される

### 1. Dedicated Worker（専用Worker）
- 最も一般的なタイプ
- 作成したスクリプトからのみ利用可能
- 1対1の関係（1つのスクリプトに1つのWorker）

#### メインスレッド
```js
// worker.js を読み込んで Web Worker を作成
const worker = new Worker('worker.js');

// メッセージを送信
worker.postMessage('Hello, Worker!');

// Worker からメッセージを受信
worker.onmessage = (event) => {
  console.log('Workerからのメッセージ:', event.data);
};

// エラーハンドリング
worker.onerror = (error) => {
  console.error('Workerエラー:', error.message);
};
```

#### worker.js
```js
// メッセージを受信
onmessage = (event) => {
  console.log('メインスレッドからのメッセージ:', event.data);

  // 処理結果を送信
  postMessage(`Received: ${event.data}`);
};
```

#### 主な用途

- 重い計算処理
- データ処理
- 画像/動画の加工

### 2. Shared Worker（共有Worker）
- 複数のスクリプト、ウィンドウ、IFrameで共有可能
- 同じオリジンの異なるブラウジングコンテキスト間で通信可能
- より複雑な通信モデル（portを使用）

#### メインスレッド
```js
// メインスクリプト
const sharedWorker = new SharedWorker('shared-worker.js');
sharedWorker.port.start();
```

#### worker.js
```js
self.onconnect = function(e) {
    const port = e.ports[0];
    port.onmessage = function(e) {
        // メッセージ処理
    }
}
```

#### 主な用途

- 複数タブ間でのデータ共有
- リソースの共有
- 同期処理の一元管理


### 3. Service Worker
- プログレッシブウェブアプリ（PWA）の重要な要素
- オフライン機能、プッシュ通知、バックグラウンド同期などを実現
- ブラウザとネットワーク間のプロキシとして動作

#### メインスレッド
```js
// 登録
navigator.serviceWorker.register('/sw.js')
    .then(registration => {
        console.log('ServiceWorker registered');
    });
```

#### worker.js
```js
self.addEventListener('install', event => {
    // インストール処理
});

self.addEventListener('fetch', event => {
    // リクエストのインターセプト
});
```

#### 主な用途

- オフラインキャッシュ
- プッシュ通知
- バックグラウンド同期
- リソースのキャッシュ管理

