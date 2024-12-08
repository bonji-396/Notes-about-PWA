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


インストール可能な PWA は、ブラウザが以下のような方法でユーザーに通知します

1. インストールプロンプト  
対応ブラウザでは、インストール可能な条件が満たされると「ホーム画面に追加」などのプロンプトが表示されます。
2. メニューバーからの追加  
一部のブラウザでは、メニューから「アプリをインストール」を選択することができます。


### アプリ制御からのインストール
アプリ側で、インストールボタンを設けて、インストールする。

```js
// インストールプロンプトの表示を制御
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // デフォルトのプロンプト表示を防ぐ
  e.preventDefault();
  // 後で使うためにイベントを保存
  deferredPrompt = e;
  // インストールボタンを表示するなどのUI更新
  showInstallButton();
});

// インストールボタンのクリックハンドラ
function installApp() {
  if (deferredPrompt) {
    // プロンプトを表示
    deferredPrompt.prompt();
    // ユーザーの選択を待つ
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('インストールされました');
      }
      // プロンプトは一度しか使えない
      deferredPrompt = null;
    });
  }
}
```

## アプリストアからのインストール
Google Play や Microsoft Store など、主要プラットフォームのアプリストアで公開し、インストール可能にすることもできます。アプリストアでの公開には追加の要件があるため、それぞれのプラットフォームのガイドラインを確認してください。

- [Google Play ストアでの公開ガイドライン](https://chromeos.dev/en/publish/pwa-in-play)
- [Microsoft ストアでの公開ガイドライン](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/microsoft-store)



## background_color

スタイルシートが読み込まれる前に表示するアプリケーションページの背景色を定義

|型|必須|
|---|---|
|String|いいえ|

### 例）
```json
"background_color": "red"
```


## categories
何をするアプリケーションなのかを開発者が説明する  

|型|必須|
|---|---|
|String の配列 (Array)|いいえ|

### 例）
```json
"categories": ["books", "education", "medical"]
```

[ W3C で定義している既知のカテゴリーの一覧](https://github.com/w3c/manifest/wiki/Categories)


## description
何をするアプリケーションなのかを開発者が説明する

|型|必須|
|---|---|
|String|いいえ|

### 例）
```json
"description": "Awesome application that will help you achieve your dreams."
```


## display
PWAの表示モードを指定する基本的なプロパティ。   
ブラウザがこのプロパティを参照して適切な表示モードを設定します

|型|必須|
|---|---|
|String|いいえ|

### 例）
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
新しい表示モードを追加するために使用されるプロパティ。特定のブラウザでサポートされていないモードがある場合にフォールバックを指定できます。

- 配列の先頭から順にブラウザが対応するモードを探します。
- ブラウザがどのモードもサポートしていない場合は、displayの値にフォールバックします。

|型|必須|
|---|---|
|Array|いいえ|

### 例）`fullscreen` → `minimal-ui` → `standalone` の順番で考慮
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


> [!NOTE]
> |特性|display|display_override|
> |---|---|---|
> |設定可能な値のタイプ|単一の値|配列形式で複数のモードを指定可能|
> |目的|基本的な表示モードを設定するため|新しいモードを指定しつつ、フォールバックの仕組みを提供する|
> |対応|ブラウザが対応している既存モードのみ設定可能|サポートされていない場合、フォールバックで別のモードを適用可能|
> |後方互換性の提供|対応なし|対応あり|
> |記述例|"display": "standalone"|"display_override": ["window-controls-overlay", "standalone"]|


## icons
アプリケーションアイコンとして機能する画像ファイルを表すオブジェクトの配列を指定

|型|必須|
|---|---|
|Array|はい|


### 例）
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


### iconsプロパティの構成要素
| プロパティ | 必須/任意 | 説明 | 設定例 |
|---|---|---|---|
| `src` | 必須 | アイコンファイルへの相対パスまたは絶対パスを指定します。| `"src": "icon-192x192.png"` |
| `sizes` | 必須 | アイコンの解像度を指定します（幅x高さの形式） | `"sizes": "192x192"` |
| `type` | 任意 | アイコンのMIMEタイプ（例: `image/png`, `image/jpeg`）を指定します | `"type": "image/png"` |
| `purpose`  | 任意  | アイコンの用途を指定します | `"purpose": "any maskable"` |


### `purpose`の主な値

| 値 | 説明 |
|---|---|
| `any` | 通常のアイコン用途（デフォルト） |
| `maskable` | マスカブルアイコン。背景色に応じたマスク処理が適用されるため、デザインがデバイスに適合します |
| `badge` | 小型のバッジアイコン用途（通知やピン留めアプリに利用されることがある） |

-|[Maskable Icons Generator](https://maskable.app) を使用してアイコンを最適化できます

### アイコンサイズの推奨
|サイズ|用途|
|---|---|
|48x48|小型アイコン（通知領域や設定メニューなど）|
|72x72|ホーム画面の小型デバイス向け|
|96x96|一部デバイスのランチャー|
|144x144|高解像度アイコン|
|192x192|PWAインストールプロンプトやAndroid向け|
|512x512|高解像度スプラッシュ画面、ホーム画面用|


## id
ウェブアプリケーションの一意な識別子

|型|必須|
|---|---|
|String|いいえ|


### 例）
```json
"id": "?homescreen=1"
```


## name

ウェブアプリケーションの名前を通常ユーザーに表示される形 (例えば、他のアプリケーションとのリストの中や、アイコンのラベルなど) 

|型|必須|
|---|---|
|String|はい|

### 例）
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
閲覧コンテキストの既定の向きを定義します。
- アプリケーションが表示される際の画面の向きを固定または推奨します
- デバイスの向きに合わせた動作を実現するか、固定の向きに制限します

|型|必須|
|---|---|
|String|いいえ|


| 値 | 説明 |
|---|---|
| `any`                | 任意の方向で表示可能（デフォルト値）|
| `natural`            | デバイスの自然な向き（通常縦向き）で表示|
| `landscape`          | 横向き（通常横長の向き）で表示可能|
| `landscape-primary`  | 横向きの主方向（デバイスの主要な横向き）に固定|
| `landscape-secondary`| 横向きの副方向（主方向の反対の横向き）に固定|
| `portrait`           | 縦向き（通常縦長の向き）で表示可能|
| `portrait-primary`   | 縦向きの主方向（デバイスの主要な縦向き）に固定|
| `portrait-secondary` | 縦向きの副方向（主方向の反対の縦向き）に固定|

### 例）縦向きに固定する場合
```json
{
  "orientation": "portrait"
}
```

### 例）横向き（主方向）のみに固定する場合
```json
{
  "orientation": "landscape-primary"
}
```

### 例）任意の方向を許可する場合
```json
{
  "orientation": "any"
}
```

## prefer_related_applications
PWA（Progressive Web App）の代わりに、関連するネイティブアプリ（例: App StoreやGoogle Playで公開されているアプリ）を推奨するために使用されます。
- 関連するネイティブアプリがある場合に、それをユーザーにインストールさせることを優先するようブラウザに指示します
- related_applications プロパティと一緒に使用します

|型|必須|
|---|---|
|String|いいえ|

- デフォルト値:  
false（PWAを優先し、関連アプリを推奨しない）

### 例）PWAの代わりに関連アプリを推奨する場合
```json
{
  "prefer_related_applications": true,
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.example.app",
      "id": "com.example.app"
    },
    {
      "platform": "itunes",
      "url": "https://apps.apple.com/app/example-app/id123456789"
    }
  ]
}
```

## related_applications

アプリに関連するネイティブアプリケーション（例: App StoreやGoogle Playで提供されるアプリ）の情報を指定するためのものです。この情報は、ユーザーにネイティブアプリのインストールを推奨する場合に使用されます。
PWAと関連するネイティブアプリケーションの情報を指定し、ブラウザがそれをユーザーに提示できるようにします。

|型|必須|
|---|---|
|Array|はい|


### 配列内の各オブジェクトに指定するプロパティ

|プロパティ|必須/任意|説明|設定例|
|---|---|---|---|
|platform|必須|関連アプリケーションが公開されているプラットフォーム（例: "play", "itunes"）。|"platform": "play"|
|url|必須|アプリケーションストアのURL。ブラウザがアプリ情報を取得するために使用されます。|"url": "https://play.google.com/store/apps/details?id=com.example.app"|
|id|任意|プラットフォーム上のアプリケーション識別子（例: Androidのパッケージ名）。|"id": "com.example.app"|

### 例） Google PlayとApp Storeのアプリを指定する場合
```json
{
  "prefer_related_applications": true,
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.example.app",
      "id": "com.example.app"
    },
    {
      "platform": "itunes",
      "url": "https://apps.apple.com/app/example-app/id123456789"
    }
  ]
}
```

## scope
PWA（Progressive Web App）がユーザーに提供するナビゲーションの範囲（スコープ）を定義します。スコープは、PWAが独立したアプリとして動作する際に、そのアプリがカバーするURL範囲を指定するものです。PWAのナビゲーション範囲を制限し、アプリがブラウザ内の他のWebサイトやURLにアクセスしないようにします。

|型|必須|
|---|---|
|String|いいえ|

### 例） アプリが特定のディレクトリ内で動作する場合
ユーザーが /app/ 内のページ（例: /app/home や /app/profile）をナビゲートしている場合、PWAとしての動作が維持されます。
それ以外の範囲（例: /about や /other/）にアクセスすると、通常のブラウザモードに戻ります。

```json
{
  "scope": "/app/",
  "start_url": "/app/home"
}
```

### 例） アプリが特定のディレクトリに限定される場合

/myapp/ 内のページにアクセスしている間、PWAモードで動作します。
```json
{
  "scope": "/myapp/",
  "start_url": "/myapp/index.html"
}
```

### 例） アプリ全体に制限を設けない場合
サイト全体がスコープ内となり、PWAモードがどのページでも適用されます。

```json
{
  "scope": "/",
  "start_url": "/index.html"
}
```


### 例） 複数のディレクトリに制限をかける場合
/shop/ に限定してPWAモードを適用。他の範囲（例: /blog/）はブラウザモードになります。

```json
{
  "scope": "/shop/",
  "start_url": "/shop/home"
}
```

## screenshots
アプリケーションのショーケースに向けたスクリーンショットの配列を定義します。これらは、PWAのインストールプロンプトやアプリの紹介ページで、アプリの外観をユーザーに示す際に利用されます。

|型|必須|
|---|---|
|String|いいえ|

### screenshots の構造
|プロパティ|必須/任意|説明|設定例|
|---|---|---|---|
|src|必須|スクリーンショット画像へのURL（相対パスまたは絶対パス）。|"src": "screenshot-1.png"|
|sizes|必須|スクリーンショット画像のサイズ（幅 x 高さ）。|"sizes": "1080x1920"|
|type|必須|スクリーンショット画像のMIMEタイプ（例: image/png, image/jpeg）。|"type": "image/png"|
|label|任意|スクリーンショットの説明またはラベル（ユーザーに表示される可能性がある）。|"label": "ホーム画面のプレビュー"|

### 例）　複数のスクリーンショットを指定する場合

```json
{
  "screenshots": [
    {
      "src": "screenshot-1.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "label": "ホーム画面のプレビュー"
    },
    {
      "src": "screenshot-2.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "label": "設定画面のプレビュー"
    },
    {
      "src": "screenshot-3.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "label": "機能紹介"
    }
  ]
}
```


## share_target
PWA がWeb Share Target APIを利用して他のアプリケーションやWebページから共有データを受け取る機能を提供するために使用されます。これにより、PWAがネイティブアプリと同様の共有機能をサポートできます。他のアプリケーションやブラウザからの共有（例: 画像、URL、テキスト）をPWAで直接受け取るために使用します。

|型|必須|
|---|---|
|Object|いいえ|

### share_target の構造

|プロパティ|必須/任意|説明|設定例
|---|---|---|---|
|action|必須|共有データを受け取るエンドポイントのURL（相対パスまたは絶対パス）。|"action": "/share"|
|method|任意|データ送信に使用するHTTPメソッド（"POST" または "GET"）。デフォルトは "POST"。|"method": "POST"|
|enctype|任意|データ送信のエンコード形式。デフォルトは "application/x-www-form-urlencoded"。|"enctype": "multipart/form-data"|
|params|必須|共有データの種類を指定するオブジェクト。以下を含む: title, text, url, files。|"params": { "title": "title" }|

### 例）　 画像やテキストを共有するPWAの例
```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "file",
          "accept": ["image/*"]
        }
      ]
    }
  }
}
```
### バックエンドでの受け取り処理の実装例

```js
const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const app = express();

app.post("/share", upload.single("file"), (req, res) => {
  console.log("Title:", req.body.title);
  console.log("Text:", req.body.text);
  console.log("URL:", req.body.url);
  console.log("File:", req.file);
  res.send("Data received!");
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

## short_name
PWAの短縮名を指定します。この短縮名は、デバイスのホーム画面やアプリランチャーなど、スペースが限られている場所で表示されます。
アプリケーション名の簡潔なバージョンを指定し、スペースが限られたUIで表示する際に使用されます。

|型|必須|
|---|---|
|String|はい|

### 例）　 
```json
{
  "name": "My Progressive Web Application",
  "short_name": "My App",
  "start_url": "/index.html"
}
```

### name と short_name の違い

|プロパティ|用途|制限|
|---|---|---|
|name|アプリのフルネームを指定|制限なし（通常30〜50文字以上も許容）|
|short_name|短縮名を指定（スペースの少ない場所用）|推奨は12〜15文字以内（デバイス依存）|

## shortcuts
PWA のショートカットリンクを定義します。このプロパティにより、ユーザーがアプリの特定の機能やページにすばやくアクセスできるようになります。
ホーム画面やアプリアイコンの「長押し」などの操作で、アプリの特定の機能やページに直接アクセスするリンクを提供します。

|型|必須|
|---|---|
|Object|いいえ|

### shortcuts の構造

プロパティ|必須/任意|説明|設定例
|---|---|---|---|
|name|必須|ショートカットの名前。UIに表示されるラベル|"name": "New Document"|
|short_name|任意|ショートカットの短縮名。スペースが限られている場合に使用される|"short_name": "New Doc"|
|description|任意|ショートカットの説明（詳細な内容）一部のブラウザUIで表示される可能性あり|"description": "Create a new document"|
|url|必須|ショートカットリンクのURL（相対パスまたは絶対パス）|"url": "/new-document"|
|icons|任意|ショートカットに関連付けるアイコンの配列（src, sizes, type を含む）|（例は後述）|

### 例)
```json
{
  "shortcuts": [
    {
      "name": "New Document",
      "short_name": "New Doc",
      "description": "Create a new document",
      "url": "/new-document",
      "icons": [
        {
          "src": "icon-new-document.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Open Recent",
      "short_name": "Recent",
      "description": "Access your recent files",
      "url": "/recent-files",
      "icons": [
        {
          "src": "icon-recent.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    }
  ]
}
```


## start_url
PWA が起動時に最初に読み込むURLを指定します。このプロパティを設定することで、アプリが一貫したエントリーポイントから始まるように制御できます。
PWAがユーザーによって起動された際に、最初に表示されるページ（エントリーポイント）を定義します。

|型|必須|
|---|---|
|String|いいえ|

### 例) ホーム画面やインストール済みのPWAから /home を開く場合
```json
{
  "start_url": "/home"
}
```

### 例) クエリパラメータを含めたURLを指定する場合
```json
{
  "start_url": "/dashboard?view=summary"
}
```

### 例) ルートURLを指定する場合
```json
{
  "start_url": "/"
}
```

### 例) 単純なエントリーポイント
/index.html を初期ページとして使用

```json
{
  "start_url": "/index.html"
}
```

### 例) ダッシュボードページを指定

ユーザーがPWAを起動すると、ダッシュボードが表示される
```json
{
  "start_url": "/dashboard"
}
```

## theme_color
PWA のテーマカラーを指定します。このカラー設定は、アプリの外観やブラウザUIの一部に影響を与え、アプリのブランドイメージやデザインの一貫性を強化します。PWAのテーマカラーを指定し、ブラウザやOSでアプリに関連するUIのスタイルを変更します。

|型|必須|
|---|---|
|String|いいえ|

### 対応可能なカラーフォーマット

- HEX値（例: "#ff6600"）
- RGB値（例: "rgb(255, 102, 0)"）
- 名前付きカラー（例: "orange"）

### 例) 単純なHEXカラーを設定する例
```json
{
  "theme_color": "#1e90ff"
}
```

### 例) RGB値で設定する例
```json
{
  "theme_color": "rgb(30, 144, 255)"
}
```

### 例) 名前付きカラーを使用する例
```json
{
  "theme_color": "dodgerblue"
}
```

### 関連プロパティとの違い

プロパティ|用途|
|---|---|
|theme_color|アプリのテーマカラー。主にブラウザUIやOSで使用される|
|background_color|アプリ起動時のスプラッシュ画面の背景色を指定する|
|display|アプリがスタンドアロンモードかブラウザモードで動作するかを指定する|