 # Web App Manifest


> https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
> https://developer.mozilla.org/ja/docs/Web/Manifest


Web App Manifestは、ブラウザーが PWA をインストールするために必要な情報（アプリ名やアイコンなど）を提供します。
Web App Manifestは、Manifestファイルという、JSON形式ファイルで定義します。
このファイルをManifestファイルといい、Webアプリケーションをモバイルデバイスのホーム画面に追加する際に、アプリの見た目や振る舞いを定義します。  

以下のような情報を含むことが一般的です

1. 名前と短い名前 (`name`, `short_name`):  
アプリのフルネームと、スペースが限られている場所で表示するための短い名前
2. アイコン (`icons`):  
ホーム画面、タスクスイッチャー、アプリドロワーなどで表示されるアイコン。異なるサイズを指定することができます
3. スタートURL (`start_url`):  
アプリがホーム画面のアイコンから起動されたときに最初に開くURL
4. 表示モード (`display`):  
アプリがどのように表示されるかを定義します（例: `fullscreen`, `standalone`, `minimal-ui`, `browser`）
5. 背景色とテーマ色 (`background_color`, `theme_color`):  
スプラッシュ画面やタスクバーに使用される色

Manifestファイルを適切に設定することで、Webアプリケーションがネイティブアプリケーションのような外観や振る舞いを実現し、ユーザーにとってより統合された体験を提供します。これはユーザーがアプリをより頻繁に使用するきっかけとなることが期待されています。


## マニュフェストファイル
マニフェストファイルの指定は、アプリのHTMLに` <link> `要素にて記述します。

```html
<!doctype html>
<html lang="ja">
  <head>
    <link rel="manifest" href="manifest.json" />
    <!-- ... -->
  </head>
  <body></body>
</html>

```

### manifest.json
最小限構成のマニフェスト

```json
{
  "name": "My PWA",
  "icons": [
    {
      "src": "icons/512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ]
}
```

## 必須のマニフェストメンバ

- `name` または `short_name`
- `icons` 192px および 512px のアイコンが必要です。
- `start_url`
- `display` や `display_override`
- `prefer-related-application` の値が`false` または `存在しない`

## ブラウザからのインストール条件
PWAアプリをインストールできるようにするにはマニュフェストファイルだけでは不十分です。  
`HTTPS`、`localhost`、`loopback` のいずれかが必須です。
PWA がインストール可能であるためには、`https` プロトコルを使用しているか、`localhost` または `127.0.0.1` を使用して、ローカル開発環境から提供しなければなりません。

> [!IMPORTANT]  
> Appleの場合  
> [iOS と iPadOS の Web アプリの Web プッシュ](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)  
> [デジタル市場法（DMA）に準拠し、EUではPWAは対応しない](https://developer.apple.com/support/dma-and-apps-in-the-eu#dev-qaa)  


## アプリストアからのインストール

Google Play ストアや Apple App ストアのような、プラットフォームが提供するアプリストアで配布するには、各アプリストア毎に規定があります。

- [Google Play ストアで公開する](https://chromeos.dev/en/publish/pwa-in-play)
- [Microsoft ストアで公開する](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/microsoft-store)



## background_color

スタイルシートが読み込まれる前に表示するアプリケーションページの背景色を定義  

- 型: String
- 必須: いいえ

例）
```json
"background_color": "red"
```

## categories
何をするアプリケーションなのかを開発者が説明する  
- 型: String の配列 (Array)
- 必須: いいえ

例）
```json
"categories": ["books", "education", "medical"]
```

## description
何をするアプリケーションなのかを開発者が説明する
- 型: String
- 必須: いいえ

例）
```json
"description": "Awesome application that will help you achieve your dreams."
```

## display
開発者が推奨するウェブサイトの表示モード  
- 型: String
- 必須: いいえ

例）
```json
"display": "standalone"
```
|表示モード|説明|代替表示モード|
|---|---|---|
|`fullscreen`|利用可能な画面の領域をすべて使用し、ツールバー、メニューバー、タブなどは表示されなくなります|`standalone`|
|`standalone`|外見は、単独のアプリケーションのようになります。|`minimal-ui`|
|`minimal-ui`|外見は、単独のアプリケーションのようになりますが、ナビゲーションを制御するために最小限の UI 要素が表示されます。要素はブラウザーによって異なります|`browser`|
|`browser`|既定値。ブラウザーやプラットフォームに応じた一般的なブラウザータブや新しいウインドウで表示されます|なし|

## display_override
開発者が推奨するウェブサイトの表示モードを決定する。要求された表示モードに対応していない場合に、ブラウザーが事次善の表示モードに代替するプロセスを指定する。
- 型: Array
- 必須: いいえ

例）`fullscreen` → `minimal-ui` → `standalone` の順番で考慮
```json
{
  "display_override": ["fullscreen", "minimal-ui"],
  "display": "standalone"
}
```

|表示モード|説明|
|---|---|
|`fullscreen`|利用可能な画面の領域をすべて使用し、ツールバー、メニューバー、タブなどは表示されなくなります|
|`standalone`|外見は、単独のアプリケーションのようになります。|
|`minimal-ui`|外見は、単独のアプリケーションのようになりますが、ナビゲーションを制御するために最小限の UI 要素が表示されます。要素はブラウザーによって異なります|
|`browser`|既定値。ブラウザーやプラットフォームに応じた一般的なブラウザータブや新しいウインドウで表示されます|
|`window-controls-overlay`|この表示モードは、アプリケーションが別の PWA ウィンドウにあり、デスクトップ OS 上にある場合にのみ適用されます。この場合、ウィンドウ制御のオーバーレイ機能が利用できるようにします。これは、ウィンドウの全領域がアプリのウェブコンテンツに使用され、ウィンドウの制御ボタン（最大化、最小化、閉じる、およびその他の PWA 固有のボタン）がウェブコンテンツの上にオーバーレイとして表示されるものです。|


## icons
様々なコンテキストでアプリケーションアイコンとして機能する画像ファイルを表すオブジェクトの配列を指定
- 型: Array
- 必須: はい

例）
```json
"icons": [
{
  "src": "icon/lowres.webp",
  "sizes": "48x48",
  "type": "image/webp"
},
{
  "src": "icon/lowres",
  "sizes": "48x48"
},
{
  "src": "icon/hd_hi.ico",
  "sizes": "72x72 96x96 128x128 256x256"
},
{
  "src": "icon/hd_hi.svg",
  "sizes": "72x72"
}
]
```
## id
ウェブアプリケーションのアイデンティティ すなわち、ウェブアプリケーションの一意な識別子
- 型: String
- 必須: いいえ

例）
```json
"id": "?homescreen=1"
```

## name

ウェブアプリケーションの名前を通常ユーザーに表示される形 (例えば、他のアプリケーションとのリストの中や、アイコンのラベルなど) 
- 型: String
- 必須: はい

例）
```json
"name": "Awesome application"
```
例）アラビヤ語で右書きの場合
```json
"dir": "rtl",
"lang": "ar",
"name": "!أنا من التطبيق"
```

## orientation
閲覧コンテキストの既定の向きを定義します
- 型: String
- 必須: いいえ

|||
|---|---|
|`any`||
|`natural`||
|`landscape`||
|`landscape-primary`||
|`landscape-secondary`||
|`portrait`||
|`portrait-primary`||
|`portrait-secondary`||

例）
```json
"orientation": "portrait-primary"
```
## prefer_related_applications
## protocol_handlers
## related_applications
## scope
## screenshots
## share_target
## short_name
## shortcuts
## start_url
## theme_color
