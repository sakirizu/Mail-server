# 🎓 Git/GitHub 初心者向けガイド - Smailプロジェクト

このガイドは、Smailプロジェクトに参加する共同開発者向けに、Git/GitHubの基本的な使い方をわかりやすく解説します。

---

## 📚 目次

1. [Git/GitHubとは？](#gitgithubとは)
2. [必要なツールのインストール](#必要なツールのインストール)
3. [プロジェクトを自分のPCにダウンロード（Clone）](#プロジェクトを自分のpcにダウンロードclone)
4. [基本的な3つの操作](#基本的な3つの操作)
5. [実際の作業フロー](#実際の作業フロー)
6. [よくある質問](#よくある質問)

---

## 🤔 Git/GitHubとは？

### Git（ギット）
- プログラムのコードを管理するツール
- 「いつ、誰が、何を変更したか」を記録できる
- 間違えても過去の状態に戻せる

### GitHub（ギットハブ）
- Gitで管理しているコードをインターネット上で共有できるサービス
- チームで一緒にプログラムを作るときに便利
- **このプロジェクトのURL**: https://github.com/sakirizu/Mail-server

### わかりやすい例え
- **Git** = タイムマシン付きのUSBメモリ
- **GitHub** = みんなで使えるクラウドストレージ（GoogleドライブやDropboxみたいなもの）

---

## 💻 必要なツールのインストール

### 1. Gitのインストール

#### Windows の場合
1. https://git-scm.com/download/win にアクセス
2. 「Click here to download」をクリック
3. ダウンロードしたファイルを実行
4. 基本的に「Next」を押し続けてOK

#### Mac の場合
ターミナル（黒い画面）を開いて以下を実行：
```bash
git --version
```
インストールされていない場合、自動的にインストール画面が表示されます。

### 2. GitHubアカウントの作成

1. https://github.com にアクセス
2. 「Sign up」をクリック
3. メールアドレス、パスワードを入力して登録
4. 作成したユーザー名を、プロジェクトオーナー（sakirizu）に教えてください
   - オーナーがあなたを「Collaborator（共同開発者）」として招待します

### 3. 招待を承認

1. GitHubからメールが届きます
2. メールの「View invitation」をクリック
3. 「Accept invitation」をクリック
4. これでプロジェクトに参加できます！

---

## 📥 プロジェクトを自分のPCにダウンロード（Clone）

「Clone（クローン）」= GitHubにあるプロジェクトを自分のPCにコピーすること

### 手順

#### 1. 作業用フォルダを決める
例えば、「ドキュメント」フォルダに「Projects」というフォルダを作成

#### 2. コマンドプロンプト（Windows）またはターミナル（Mac）を開く

**Windows**:
- スタートメニューで「cmd」と検索
- 「コマンドプロンプト」を開く

**Mac**:
- Spotlightで「ターミナル」と検索
- 「ターミナル」を開く

#### 3. 作業用フォルダに移動

```bash
# Windowsの例
cd C:\Users\あなたの名前\Documents\Projects

# Macの例
cd ~/Documents/Projects
```

#### 4. プロジェクトをClone

```bash
git clone https://github.com/sakirizu/Mail-server.git
```

✅ これで「Mail-server」というフォルダができます！

#### 5. プロジェクトフォルダに移動

```bash
cd Mail-server
```

---

## 🔄 基本的な3つの操作

Git/GitHubでの開発は、基本的に以下の3つの操作を繰り返します：

### 1️⃣ Pull（プル）= ダウンロード

**意味**: GitHubにある最新の変更を自分のPCにダウンロード

**いつ使う？**
- 作業を始める前に毎回
- 他の人が変更したコードを取得したいとき

**コマンド**:
```bash
git pull origin main
```

**わかりやすい例え**:
- GoogleドライブからWordファイルをダウンロードするイメージ

---

### 2️⃣ Commit（コミット）= 変更を記録

**意味**: 自分がした変更を記録する（まだGitHubには送らない）

**いつ使う？**
- コードを変更したあと
- 「ここまでの作業を保存」というタイミング

**コマンド**:
```bash
# ステップ1: 変更したファイルを「記録対象」にする
git add .

# ステップ2: 変更を記録する（メッセージ付き）
git commit -m "ログイン画面のデザインを修正"
```

**わかりやすい例え**:
- Wordで「上書き保存」を押すイメージ
- `git add` = 保存したいファイルを選ぶ
- `git commit` = 実際に保存する

---

### 3️⃣ Push（プッシュ）= アップロード

**意味**: 自分がCommitした変更をGitHubにアップロード

**いつ使う？**
- Commitした変更を他の人と共有したいとき
- 作業が終わったとき

**コマンド**:
```bash
git push origin main
```

**わかりやすい例え**:
- GoogleドライブにWordファイルをアップロードするイメージ

---

## 🛠️ 実際の作業フロー

### 毎日の作業の流れ

#### 📅 作業開始時

```bash
# 1. Mail-serverフォルダに移動
cd C:\Users\あなたの名前\Documents\Projects\Mail-server

# 2. 最新の変更をダウンロード
git pull origin main
```

#### ✏️ コードを編集

Visual Studio Codeやメモ帳などで、好きなファイルを編集します。

#### 💾 変更を記録してアップロード

```bash
# 1. 現在の状態を確認（何が変更されたか見る）
git status

# 2. 変更したファイルを記録対象にする
git add .

# 3. 変更を記録（メッセージは何をしたか簡単に書く）
git commit -m "ボタンの色を赤から青に変更"

# 4. GitHubにアップロード
git push origin main
```

#### 📝 Commitメッセージの書き方

**良い例**:
- ✅ `"ログイン画面のデザインを修正"`
- ✅ `"受信トレイの表示バグを修正"`
- ✅ `"送信ボタンを追加"`

**悪い例**:
- ❌ `"変更"` （何を変更したかわからない）
- ❌ `"aaa"` （意味不明）
- ❌ `"修正した"` （何を修正したか不明）

---

## 📋 よく使うコマンド一覧

### 状態を確認

```bash
# 何が変更されたか確認
git status

# これまでの変更履歴を見る
git log

# 現在どのブランチにいるか確認
git branch
```

### 作業の流れ

```bash
# 1. 最新版をダウンロード
git pull origin main

# 2. ファイルを編集（Visual Studio Codeなどで）

# 3. 変更を記録
git add .
git commit -m "変更内容をここに書く"

# 4. GitHubにアップロード
git push origin main
```

---

## ❓ よくある質問

### Q1: 「git pull」と「git clone」の違いは？

**git clone**:
- 初めてプロジェクトをダウンロードするとき
- 1回だけ実行

**git pull**:
- 既にダウンロード済みのプロジェクトを最新にするとき
- 作業の度に実行

**例え**:
- `git clone` = 新しいゲームをダウンロード
- `git pull` = ゲームのアップデートをダウンロード

---

### Q2: エラーが出たらどうすればいい？

#### エラー: `Your local changes would be overwritten by merge`

**原因**: あなたの変更と他の人の変更が衝突している

**解決方法**:
```bash
# 変更をコミットしてからpull
git add .
git commit -m "作業中の変更を保存"
git pull origin main
```

#### エラー: `Permission denied`

**原因**: GitHubへのアクセス権限がない

**解決方法**:
1. プロジェクトオーナーに「Collaborator」として招待されているか確認
2. 招待メールの「Accept invitation」をクリックしたか確認

---

### Q3: 間違えてCommitしてしまった！

**直前のCommitを取り消す**:
```bash
git reset --soft HEAD~1
```

これで、Commitは取り消されますが、変更したファイルはそのまま残ります。

---

### Q4: 他の人の変更と自分の変更が衝突したらどうなる？

**Conflict（コンフリクト）** が発生します。

**解決方法**:
1. Gitが教えてくれるファイルを開く
2. `<<<<<<<`、`=======`、`>>>>>>>` という記号が見つかる
3. どちらの変更を採用するか選んで、記号を削除
4. 再度 `git add` → `git commit` → `git push`

**例**:
```javascript
<<<<<<< HEAD
const color = "red";  // あなたの変更
=======
const color = "blue"; // 他の人の変更
>>>>>>> main
```

どちらか一方（または両方を組み合わせ）を選んで保存します。

---

## 🎯 練習してみよう！

### 初めてのCommit & Push

1. プロジェクトの`README.md`を開く
2. 一番下に自分の名前を追加:
   ```markdown
   ## 共同開発者
   - あなたの名前
   ```
3. 保存する
4. 以下のコマンドを実行:
   ```bash
   git add .
   git commit -m "共同開発者として自分の名前を追加"
   git push origin main
   ```
5. https://github.com/sakirizu/Mail-server を開いて確認！

---

## 📞 困ったときは

### 1. Git公式ドキュメント（日本語）
https://git-scm.com/book/ja/v2

### 2. GitHub公式ガイド
https://docs.github.com/ja

### 3. プロジェクトオーナーに相談
わからないことがあれば、遠慮なく聞いてください！

---

## 🎉 まとめ

### 基本の3ステップを覚えよう！

```bash
# 1. 最新版をダウンロード
git pull origin main

# 2. 変更を記録
git add .
git commit -m "何をしたか書く"

# 3. GitHubにアップロード
git push origin main
```

この3つができれば、チームで開発できます！🚀

---

**作成日**: 2024年11月13日  
**プロジェクト**: Smail Email Client  
**リポジトリ**: https://github.com/sakirizu/Mail-server

