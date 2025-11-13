# 🚀 Git コマンド チートシート

すぐに使える！Git/GitHubコマンド早見表

---

## 📝 毎日使う基本コマンド

### 🔄 作業の流れ（これだけ覚えればOK！）

```bash
# ① 朝イチ：最新版をダウンロード
git pull origin main

# ② ファイルを編集（Visual Studio Codeなどで）

# ③ 変更を確認
git status

# ④ 変更を記録
git add .
git commit -m "変更内容を簡単に書く"

# ⑤ GitHubにアップロード
git push origin main
```

---

## 🎯 状況別コマンド

### 📥 最初にプロジェクトをダウンロード（1回だけ）

```bash
# GitHubからプロジェクトをコピー
git clone https://github.com/sakirizu/Mail-server.git

# プロジェクトフォルダに移動
cd Mail-server
```

---

### 🔄 他の人の変更を取得

```bash
# 最新版をダウンロード
git pull origin main
```

**いつ使う？**: 作業を始める前に毎回！

---

### 💾 自分の変更を保存

```bash
# 全ての変更ファイルを記録対象にする
git add .

# 特定のファイルだけ記録対象にする
git add ファイル名

# 変更を記録（メッセージ付き）
git commit -m "何を変更したか書く"
```

**メッセージの例**:
- `"ログイン画面のボタンを追加"`
- `"受信トレイのバグを修正"`
- `"README.mdを更新"`

---

### 📤 GitHubにアップロード

```bash
# 自分の変更をGitHubに送る
git push origin main
```

**注意**: Pushする前に必ず `git pull` して最新版を取得！

---

## 🔍 状態確認コマンド

```bash
# 何が変更されたか確認
git status

# 変更履歴を見る
git log

# 変更履歴を見やすく表示
git log --oneline

# 現在のブランチを確認
git branch
```

---

## 🆘 トラブル解決コマンド

### ❌ 直前のCommitを取り消したい

```bash
# Commitを取り消す（ファイルの変更は残る）
git reset --soft HEAD~1
```

---

### ❌ ファイルの変更を全部なかったことにしたい

```bash
# ⚠️ 注意：変更が完全に消えます！
git restore ファイル名

# 全ての変更を取り消す
git restore .
```

---

### ❌ 「Your local changes would be overwritten」エラー

```bash
# 自分の変更を一時保存
git stash

# 最新版を取得
git pull origin main

# 一時保存した変更を戻す
git stash pop
```

---

### ❌ Pullしようとしたら「Conflict」が出た

**手順**:
1. 競合しているファイルを開く
2. `<<<<<<<`、`=======`、`>>>>>>>` を探す
3. どちらの変更を採用するか決めて、記号を削除
4. 保存して再度Commit

```bash
git add .
git commit -m "コンフリクトを解決"
git push origin main
```

---

## 📊 図で理解する Git の流れ

```
あなたのPC                  GitHub
─────────                  ────────

[ファイル編集]
     ↓
git add .
     ↓
git commit          →    git push    →    [リモートリポジトリ]
     ↑                                            ↓
     └──────────────    git pull    ←────────────┘

```

---

## 🎨 gitコマンドの色分け

### 🟢 安全（いつでもOK）
- `git status` - 状態確認
- `git log` - 履歴確認
- `git branch` - ブランチ確認

### 🟡 注意（使う前に確認）
- `git pull` - 他の人の変更を取得
- `git push` - 自分の変更をアップロード
- `git commit` - 変更を記録

### 🔴 危険（よく理解してから使う）
- `git reset --hard` - 変更を完全に削除
- `git push --force` - 強制的にアップロード（使わない！）

---

## 📖 用語集

| 用語 | 読み方 | 意味 |
|------|--------|------|
| Clone | クローン | プロジェクトをコピーする |
| Pull | プル | 最新版をダウンロード |
| Push | プッシュ | 変更をアップロード |
| Commit | コミット | 変更を記録 |
| Branch | ブランチ | 作業の枝分かれ |
| Merge | マージ | 変更を統合 |
| Conflict | コンフリクト | 変更の衝突 |
| Repository | リポジトリ | プロジェクトの保管場所 |
| Remote | リモート | GitHub上のリポジトリ |
| Local | ローカル | 自分のPC上のリポジトリ |

---

## 🎯 よくある質問

### Q: `git add .` の「.」って何？
**A**: 「全てのファイル」という意味です。

### Q: 毎回「origin main」って何？
**A**: 
- `origin` = GitHubのリポジトリ
- `main` = メインのブランチ（作業する場所）

### Q: Commitメッセージは日本語でもいい？
**A**: はい！日本語でOKです。

### Q: 何回Commitすればいい？
**A**: 小まめにCommitするのが良いです。例：
- 機能を1つ追加したら → Commit
- バグを1つ修正したら → Commit

---

## 🔗 便利なリンク

- **このプロジェクトのGitHub**: https://github.com/sakirizu/Mail-server
- **Git公式サイト**: https://git-scm.com/
- **GitHub公式ガイド**: https://docs.github.com/ja

---

## 💡 覚えておくと便利なこと

### エイリアス（短縮コマンド）を設定

```bash
# 「git st」で「git status」を実行できるようになる
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
```

---

**最終更新**: 2024年11月13日  
**プロジェクト**: Smail Email Client

印刷して手元に置いておくと便利です！📄

