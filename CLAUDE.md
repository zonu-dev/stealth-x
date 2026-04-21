# Stealth X - Claude Code Guidelines

## プロジェクト概要

**Stealth X** は、X（Twitter）で自分のアカウント情報をローカルでマスクする Chrome 拡張機能です。  
職場や共有スペースで X を開くときに、肩越しに見られても自分のアカウントが特定されにくいようにします。

**特徴:**
- ローカル表示のマスキングのみ（投稿・ログイン・API 通信に影響なし）
- 外部送信・データ収集なし
- 権限最小化（storage と x.com/twitter.com の content script のみ）
- 認証情報・Cookie を扱わない設計

**バージョン:** 1.0.0  
**ライセンス:** MIT

## Code Style

### TypeScript
- `strict: true` で厳格な型チェック
- `noImplicitAny: true`
- インターフェース名は `I` プリフィックスなし（例: `MaskSettings`）

### 命名規則
- 関数・変数: `camelCase`
- 定数・マジック値: `SCREAMING_SNAKE_CASE`
- DOM セレクタ定数: `{TARGET}_SELECTORS`（例: `AVATAR_CONTAINER_SELECTORS`）
- プライベート関数: `_camelCase` プリフィックス

### コメント
- 「何をしているか」ではなく「なぜ」を書く
- 複雑な正規表現には説明コメント必須
- 1行以内に収める

## 技術スタック

| 要素 | 技術 | 備考 |
|------|------|------|
| **フレームワーク** | Chrome Manifest V3 | 最新の Chrome 拡張仕様 |
| **言語** | TypeScript 5.8.3 | strict mode, ES2022 target |
| **バンドラー** | esbuild 0.25.4 | 高速ビルド、watch mode サポート |
| **テスト** | Vitest 3.1.3 + jsdom 26.1.0 | DOM テスト環境 |
| **型チェック** | tsc --noEmit | ビルド前の検証 |

## ディレクトリ構成

```
stealth-x/
├── src/
│   ├── content/          # Content script（DOM マスキング実装）
│   │   ├── index.ts      # entry point: MutationObserver, 初期化
│   │   ├── masking.ts    # マスキング関数群（1190行の大規模ロジック）
│   │   └── masking.test.ts
│   ├── popup/            # Popup UI（ON/OFF トグル、簡易設定）
│   │   └── index.ts
│   ├── options/          # Options ページ（細かい設定）
│   │   └── index.ts
│   └── shared/           # 共有ロジック
│       ├── settings.ts   # 設定型定義、Chrome Storage API ラッパー
│       └── settings.test.ts
├── static/               # 静的ファイル（manifest.json, HTML, 画像）
│   ├── manifest.json     # Chrome 拡張マニフェスト
│   ├── popup.html
│   ├── options.html
│   └── avatar-placeholder.png
├── scripts/
│   └── build.mjs         # esbuild ビルドスクリプト（watch mode 対応）
├── dist/                 # ビルド出力（.gitignore）
└── package.json, tsconfig.json, etc.
```

## コア概念

### 1. 設定管理（shared/settings.ts）

```typescript
interface MaskSettings {
  enabled: boolean;
  mode: "alias";
  maskDisplayName: boolean;
  maskUsername: boolean;
  maskAvatar: boolean;
  maskBanner: boolean;
  maskBio: boolean;
  maskStats: boolean;
  maskLocation: boolean;
  maskJoinDate: boolean;
  maskPostCount: boolean;
}
```

- Chrome Storage API（sync）で複数デバイス間に同期
- `DEFAULT_SETTINGS` で全機能有効がデフォルト
- `normalizeSettings()` で部分更新と型統一
- content script と popup が同じ型を共有

### 2. DOM マスキング戦略（content/masking.ts）

セレクタベースの DOM マスキング：
- **テキスト置換**: 元の値を `data-stealth-x-original-text` に保存し、表示を「非表示」に置換
- **ブロック隠蔽**: `data-stealth-x-block` attribute で `::after` 疑似要素の灰色バーを表示
- **アバター・メディア隠蔽**: 専用 attribute（`data-stealth-x-avatar`, `data-stealth-x-media`）で画像を置換

詳細は `masking.ts` の定数セクション（`*_SELECTORS`, `createStyles()`）を参照。

### 3. 自分のアカウント判定（content/masking.ts）

`resolveCurrentAccount()` で複数の方法でハンドルを検出：左下の `SideNav_AccountSwitcher_Button` から抽出 → `@username` パターンマッチング → avatar container の `data-testid` → リンク href。**IMPORTANT:** マスキング適用前に必ず `elementBelongsToCurrentUser()` で確認。

### 4. パフォーマンス最適化（content/index.ts）

`requestAnimationFrame` + `Set` でバッチ処理：DOM 変更を MutationObserver で拾い、`pendingRoots` に追加。フレーム毎に一度だけ `applyMasking()` を実行し、複数更新をまとめる。

## 開発フロー

### インストール・セットアップ

```bash
npm install
npm run check    # 型チェック（CI で実行）
npm test         # テスト実行
npm run build    # 本番ビルド（dist/ 出力）
npm run dev      # watch mode（開発時）
```

### ビルドプロセス（scripts/build.mjs）

1. `dist/` を削除（初期化）
2. esbuild で 3 つの entry point をバンドル:
   - `content.js` - content script
   - `popup.js` - popup UI
   - `options.js` - options UI（entry point 確認）
3. `static/` を `dist/` にコピー（manifest.json, HTML など）
4. watch mode: ソース変更時に自動再構築

**esbuild 設定:**
- Format: IIFE（ブラウザ環境）
- Target: chrome120
- Platform: browser
- Bundle: true（依存関係を埋め込み）
- Minify: false（読みやすさ重視）

### Chrome 拡張として実行

1. `npm run build`
2. Chrome: `chrome://extensions/` を開く
3. 「デベロッパーモード」有効化
4. 「パッケージ化されていない拡張機能を読み込む」→ `dist/` を選択
5. popup または options ページで設定変更
6. X.com でマスキング確認

## マスキング機能

マスキング対象は `MaskSettings` の各フラグで制御（`maskDisplayName`, `maskUsername`, `maskAvatar`, `maskBanner`, `maskBio`, `maskStats`, `maskLocation`, `maskJoinDate`, `maskPostCount`）。詳細なセレクタと処理は `masking.ts` の関数群（`applyIdentityMask()`, `applyAvatarMask()` 等）を参照。

### マスキング解除（restoreMasking）

`applyCurrentSettings()` で `enabled: false` の場合、または content script 無効化時：

```typescript
export function restoreMasking(root: ParentNode = document) {
  // 元のテキスト復元
  // 属性・クラス削除
  // document title 復元
}
```

すべての変更は reversible（非破壊）。

## セキュリティ・プライバシー原則

### 設計原則

1. **外部送信なし** - DOM 情報や設定を外部サーバーに送信しない
2. **認証情報を扱わない** - Cookie, localStorage, JWT token にアクセスしない
3. **権限最小化** - `storage` permission と `x.com` / `twitter.com` content script のみ
4. **ローカル処理のみ** - すべてのマスキングは browser 上で実行
5. **設定の同期のみ** - Chrome Storage API で sync（user 認証下）

### 既知の制限

- **X の DOM 変更に脆弱**: data-testid や DOM 構造が変わると selector が壊れる可能性 → 複数化・fallback で緩和
- **画面共有・スクリーンショット対策なし** - ローカル表示隠蔽のみ（browser 拡張の能力範囲外）
- **document.title のマスキング** - ブラウザタブには表示（プロフィールページ時のみマスク）
- **非同期初期化** - content script と popup の初期化タイミング → `chrome.storage.onChanged` listener で常に最新状態を保つ

## テスト・実装パターン

### テスト実行
```bash
npm test           # Vitest で全テスト実行（jsdom 環境）
npm run check      # TypeScript 型チェック
```

実装済みテスト: `src/content/masking.test.ts`, `src/shared/settings.test.ts`

### 新機能追加時の流れ

**マスキング対象追加:**
1. `masking.ts` に `apply{Feature}Mask()` 関数実装
2. `applyMasking()` の末尾に呼び出し追加
3. `masking.test.ts` に単体テスト（jsdom + mock account）
4. `settings.ts` に設定フラグ追加、`DEFAULT_SETTINGS` 更新
5. `popup/index.ts` に UI チェックボックス追加
6. 実機テスト（X.com で動作確認）

## 一般的なタスク・パターン

### 新しいマスキング対象の追加

例: プロフィールの「Web サイト」情報をマスク

1. **セレクタ定義** (masking.ts 冒頭)
   ```typescript
   const WEBSITE_SELECTORS = ['[data-testid="UserWebsite"]'];
   ```

2. **マスキング関数実装**
   ```typescript
   function applyWebsiteMask(
     root: ParentNode,
     settings: MaskSettings,
     account: CurrentAccount
   ) {
     if (!settings.maskWebsite) return;
     for (const element of collectMatches<HTMLElement>(root, WEBSITE_SELECTORS)) {
       if (!elementBelongsToCurrentUser(element, account)) continue;
       concealBlock(element, "ウェブサイト非表示");
     }
   }
   ```

3. **設定に追加** (shared/settings.ts)
   ```typescript
   interface MaskSettings {
     // ...
     maskWebsite: boolean;
   }
   
   const DEFAULT_SETTINGS: MaskSettings = {
     // ...
     maskWebsite: true,
   };
   ```

4. **popup UI に追加**
   ```html
   <input type="checkbox" id="maskWebsite" />
   <label for="maskWebsite">ウェブサイトをマスク</label>
   ```

5. **テスト追加** (masking.test.ts)
6. **applyMasking() に呼び出し追加**

### セレクタの検証・修正

X の DOM が変わった場合：

1. Chrome DevTools で該当要素を inspect
2. `data-testid` や class を確認
3. `SELECTOR_NAME` 配列に新しい selector を追加
4. 既存 selector コメントアウト（後で削除）
5. テスト実行・動作確認

### パフォーマンス問題の調査

観察: マスキング処理が重い、X の操作が遅くなった

1. Chrome DevTools > Performance タブで record
2. `requestAnimationFrame` のコールスタック確認
3. `pendingRoots` の size が大きくないか確認
4. `collectMatches()` で selector の絞り込み検討
5. `getTextNodes()` の TreeWalker が過度に走っていないか確認

## 修正・改善の流れ

1. **ローカルで `npm run dev` で watch 開始**
2. **修正実装 → `npm test` → `npm run check` で検証**
3. **Chrome で拡張を reload → X.com で動作確認**
4. **commit & main への push**

## 注意: このプロジェクトの使用目的

本拡張機能は**プライバシー保護目的**の正当な用途を想定しています。

- ✅ 職場での閲覧時のプライバシー保護
- ✅ 共有スペースでの利用
- ✅ 肩越し盗み見対策

悪用を想定した機能追加（例: 他人の認証情報窃取、トラッキング）は追加しません。
