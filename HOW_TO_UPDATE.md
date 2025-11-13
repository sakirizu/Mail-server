# 🔄 プロジェクトを最新版に更新する方法

既にプロジェクトをCloneしている人向けの、最新版取得ガイドです。

---

## ✅ 基本の更新方法

### ステップ1: プロジェクトフォルダに移動

```bash
# Windowsの例
cd C:\Users\あなたの名前\Documents\Projects\Mail-server

# Macの例
cd ~/Documents/Projects/Mail-server
```

### ステップ2: 最新版を取得

```bash
git pull origin main
```

✅ これだけで最新版になります！

---

## 📊 更新内容を確認

### 何が更新されたか見る

```bash
# 最新の変更履歴を見る
git log --oneline -5
```

**表示されるはず**:
- `d63c776` Add beginner-friendly Git/GitHub guides
- `f32a7ca` Migrate to Next.js with custom red/yellow design
- （その他の履歴）

---

## 🆘 エラーが出た場合

### ❌ エラー1: "Your local changes would be overwritten"

**意味**: あなたの変更と最新版が衝突しています

**解決方法A**: 自分の変更を保存してから更新

```bash
# 自分の変更をCommit
git add .
git commit -m "作業中の変更を保存"

# 最新版を取得
git pull origin main
```

**解決方法B**: 自分の変更を一時退避

```bash
# 変更を一時保存
git stash

# 最新版を取得
git pull origin main

# 一時保存した変更を戻す
git stash pop
```

**解決方法C**: 自分の変更を破棄（⚠️変更が消えます）

```bash
# 変更を破棄
git restore .

# 最新版を取得
git pull origin main
```

---

### ❌ エラー2: "fatal: not a git repository"

**意味**: 今いるフォルダがGitプロジェクトではない

**解決方法**: 正しいフォルダに移動

```bash
# Mail-serverフォルダを探す
# Windowsの場合
dir /s /b Mail-server

# 見つかったパスに移動
cd [見つかったパス]

# 再度pull
git pull origin main
```

---

### ❌ エラー3: "Permission denied"

**意味**: GitHubへのアクセス権限がない

**解決方法**:
1. プロジェクトオーナーに「Collaborator」として招待されているか確認
2. 招待メールの「Accept invitation」をクリック
3. 再度 `git pull origin main`

---

## 🔄 毎日の更新習慣

### 作業を始める前に必ず実行

```bash
# Mail-serverフォルダに移動
cd [あなたのMail-serverフォルダのパス]

# 最新版を取得
git pull origin main

# 依存関係も更新（package.jsonが変わった場合）
npm install
```

これで常に最新版で作業できます！✨

---

## 💡 更新後にすること

### プロジェクトが大きく変わった場合

今回の更新（Expo → Next.js移行）では、以下も実行してください：

```bash
# 1. 最新版を取得
git pull origin main

# 2. 依存関係を再インストール
npm install

# 3. バックエンドの依存関係も更新
cd backend
npm install
cd ..

# 4. サーバーを再起動
# ターミナル1
npm run backend

# ターミナル2
npm run dev
```

---

## 📚 関連ガイド

- **Git完全ガイド**: [GITHUB_GUIDE_FOR_BEGINNERS.md](GITHUB_GUIDE_FOR_BEGINNERS.md)
- **コマンド早見表**: [GIT_CHEAT_SHEET.md](GIT_CHEAT_SHEET.md)
- **クイックスタート**: [QUICK_START.md](QUICK_START.md)

---

**最終更新**: 2024年11月13日  
**プロジェクト**: Smail Email Client  
**リポジトリ**: https://github.com/sakirizu/Mail-server

