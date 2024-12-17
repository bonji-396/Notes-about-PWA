# PWA (Progressive Web Applications) についてのノート
PWAについての調査ノートです。  
MDNに親切丁寧に記載されているのですが、あえて自身の為に記載しているものです。
PWA実装の実践を行うために、調べたことを記載してます。

## Index

|項目|説明|
|---|---|
[About PWA](./about-pwa.md)  |PWAについてにのメモです。ネイティブアプリ、既存のWebアプリとの（特に構成や通信方法などを図によって）比較します。|
|[PWAとしての機能](./function-as-pwa.md)|PWAとして、どのような機能が必要なのか？を記載|
|[Manifest](./manifest.md)|PWAがネイティブアプリのようにインストール可能にするため、ウェブアプリマニュフェストを作成し必要な設定を記載します。|
|[Service Worker API](./service-worker-api.md)|PWAの中核的な技術で、主にオフライン対応やバックグラウンド処理を行うよう実装します。|
|[Cache Interface](./cache-interface.md)|ネットワークリクエストのレスポンスを保存・取得するための仕組みです。Service Workerと連携して、リクエストのレスポンスをカスタマイズし、オフライン対応を行います。|
|Background Synchronization API||
|Background Fetch API||
|Web Periodic Background Synchronization API||
|Push API||
|Notifications API||
|IndexDb||
|Native Device Features||
|Service Worker Management||
|SPA と PWA||

## 補足
- [WebWorker](./webworker.md)

## 参考サイト
- [MDN: プログレッシブウェブアプリ (PWA)](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps)

## TypeScriptで、PWAを利用する
- Service Worker
