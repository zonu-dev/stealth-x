# Stealth X v1.2.0 Chrome Web Store Submission Notes

## Package

- Upload ZIP: `stealth-x-v1.2.0.zip`
- Manifest version: `1.2.0`
- Screenshots: `output/store-images/final/`
- Store description: `output/chrome-web-store/v1.2.0/store-description-ja.md`
- Privacy policy: `PRIVACY.md`

## Release Notes

非表示の詳細設定に「ポスト」を追加しました。デフォルトONで、自分のポスト本文・メディア・いいね数などの投稿内容をまとめて隠し、「クリックで表示」バッジを表示します。ポストをクリックしている間だけ内容を一時的に確認できます。

## Permission Justification

- `storage`: 拡張機能のON/OFFと、表示名・@ID・アイコン・ポストなどの非表示設定を保存するために使用します。
- `https://x.com/*`, `https://twitter.com/*`: X/Twitter上の自分のアカウント情報を、ブラウザ内の表示だけローカルでマスクするために使用します。

## Privacy Notes

- 外部サーバーへの送信はありません。
- Cookie、アクセストークン、認証情報は読み取りません。
- 投稿、ログイン状態、X API通信には変更を加えません。

## Verification

- `npm test -- --run`: passed
- `npm run check`: passed
- `npm run build`: passed
- ZIP contents verified with `unzip -l stealth-x-v1.2.0.zip`
