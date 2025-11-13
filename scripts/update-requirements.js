#!/usr/bin/env node

/**
 * 要件定義書自動更新スクリプト
 * Gitのコミット履歴から前回更新以降の変更を抽出し、REQUIREMENTS.mdを更新します
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REQUIREMENTS_FILE = path.join(__dirname, '..', 'REQUIREMENTS.md');
const LAST_UPDATE_FILE = path.join(__dirname, '..', '.requirements-last-update');

// 前回更新日時を取得
function getLastUpdateTime() {
  if (fs.existsSync(LAST_UPDATE_FILE)) {
    const content = fs.readFileSync(LAST_UPDATE_FILE, 'utf-8').trim();
    return content || null;
  }
  return null;
}

// 前回更新日時を保存
function saveLastUpdateTime() {
  const now = new Date().toISOString();
  fs.writeFileSync(LAST_UPDATE_FILE, now, 'utf-8');
  return now;
}

// Gitコミット履歴を取得
function getCommitsSince(lastUpdateTime) {
  try {
    let command;
    if (lastUpdateTime) {
      // 前回更新以降のコミットを取得
      const dateStr = new Date(lastUpdateTime).toISOString();
      command = `git log --since="${dateStr}" --pretty=format:"%h|%an|%ad|%s" --date=iso --reverse`;
    } else {
      // 全コミットを取得（初回更新時）
      command = `git log --pretty=format:"%h|%an|%ad|%s" --date=iso --reverse`;
    }
    
    const output = execSync(command, { encoding: 'utf-8', cwd: path.join(__dirname, '..') });
    return output.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('Gitコマンドの実行に失敗しました:', error.message);
    return [];
  }
}

// コミットから変更されたファイルを取得
function getChangedFiles(commitHash) {
  try {
    const command = `git show --name-status --pretty=format: ${commitHash}`;
    const output = execSync(command, { encoding: 'utf-8', cwd: path.join(__dirname, '..') });
    return output.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

// 英語のコミットメッセージを日本語に変換（よく使われるパターンのみ）
function translateCommitMessage(message) {
  const commonPatterns = {
    // 動詞
    'add': '追加',
    'update': '更新',
    'fix': '修正',
    'remove': '削除',
    'delete': '削除',
    'create': '作成',
    'implement': '実装',
    'improve': '改善',
    'refactor': 'リファクタリング',
    'clean': '整理',
    'change': '変更',
    'modify': '変更',
    'enhance': '強化',
    'optimize': '最適化',
    'migrate': '移行',
    'setup': 'セットアップ',
    'configure': '設定',
    // 名詞
    'guide': 'ガイド',
    'documentation': 'ドキュメント',
    'docs': 'ドキュメント',
    'readme': 'README',
    'feature': '機能',
    'bug': 'バグ',
    'error': 'エラー',
    'test': 'テスト',
    'file': 'ファイル',
    'files': 'ファイル',
    'component': 'コンポーネント',
    'page': 'ページ',
    'service': 'サービス',
    'function': '関数',
    'module': 'モジュール',
    'package': 'パッケージ',
    'config': '設定',
    'server': 'サーバー',
    'client': 'クライアント',
    'database': 'データベース',
    'auth': '認証',
    'security': 'セキュリティ',
    'performance': 'パフォーマンス',
    // よく使われるフレーズ
    'initial commit': '初期コミット',
    'clean up': '整理',
    'for': 'の',
    'to': 'へ',
    'with': 'と',
    'and': 'と',
    'of': 'の',
    'by': 'による',
    'from': 'から',
  };

  let translated = message;
  const lowerMessage = message.toLowerCase();
  
  // フレーズ単位で変換（長いものから順に）
  Object.keys(commonPatterns).sort((a, b) => b.length - a.length).forEach(pattern => {
    if (lowerMessage.includes(pattern)) {
      translated = translated.replace(
        new RegExp(pattern, 'gi'),
        commonPatterns[pattern]
      );
    }
  });

  return translated;
}

// 変更内容を分類
function categorizeChange(message) {
  const lowerMessage = message.toLowerCase();
  const translatedMessage = translateCommitMessage(message).toLowerCase();
  
  if (lowerMessage.includes('add') || lowerMessage.includes('追加') || lowerMessage.includes('新規') || 
      translatedMessage.includes('追加') || translatedMessage.includes('新規')) {
    return '機能追加';
  } else if (lowerMessage.includes('fix') || lowerMessage.includes('修正') || lowerMessage.includes('bug') ||
             translatedMessage.includes('修正') || translatedMessage.includes('バグ')) {
    return 'バグ修正';
  } else if (lowerMessage.includes('update') || lowerMessage.includes('更新') || lowerMessage.includes('変更') ||
             translatedMessage.includes('更新') || translatedMessage.includes('変更')) {
    return '機能更新';
  } else if (lowerMessage.includes('refactor') || lowerMessage.includes('リファクタ') ||
             translatedMessage.includes('リファクタリング')) {
    return 'リファクタリング';
  } else if (lowerMessage.includes('remove') || lowerMessage.includes('delete') || lowerMessage.includes('削除') || 
             lowerMessage.includes('clean') || translatedMessage.includes('削除') || translatedMessage.includes('整理')) {
    return '削除・整理';
  } else if (lowerMessage.includes('docs') || lowerMessage.includes('documentation') || 
             lowerMessage.includes('ドキュメント') || lowerMessage.includes('readme') ||
             translatedMessage.includes('ドキュメント')) {
    return 'ドキュメント';
  } else {
    return 'その他';
  }
}

// 変更履歴セクションを生成
function generateChangeHistory(commits) {
  if (commits.length === 0) {
    return '### 未更新\n\n要件定義書はまだ更新されていません。\n`npm run update-requirements` を実行するか、Cursor Chatで「更新」と入力して更新してください。';
  }

  let history = '';
  const groupedByDate = {};
  const categories = {
    '機能追加': [],
    'バグ修正': [],
    '機能更新': [],
    'リファクタリング': [],
    '削除・整理': [],
    'ドキュメント': [],
    'その他': []
  };

  // コミットを分類
  commits.forEach(commitLine => {
    // パイプ文字で分割（メッセージ部分にパイプが含まれる可能性があるため、最初の3つだけ分割）
    const parts = commitLine.split('|');
    const hash = parts[0];
    const author = parts[1];
    const date = parts[2];
    const message = parts.slice(3).join('|'); // 残りの部分を結合してメッセージとして扱う
    const category = categorizeChange(message);
    const dateOnly = date.split('T')[0];
    
    if (!groupedByDate[dateOnly]) {
      groupedByDate[dateOnly] = [];
    }
    
    groupedByDate[dateOnly].push({
      hash: hash.substring(0, 7),
      author,
      date: dateOnly,
      message,
      translatedMessage: translateCommitMessage(message),
      category
    });
    
    categories[category].push({ hash: hash.substring(0, 7), author, message });
  });

  // 日付ごとにグループ化して表示
  const sortedDates = Object.keys(groupedByDate).sort().reverse();
  
  sortedDates.forEach(date => {
    history += `### ${date}\n\n`;
    
    groupedByDate[date].forEach(commit => {
      const files = getChangedFiles(commit.hash);
      const fileList = files.length > 0 
        ? files.slice(0, 10).map(f => {
            const status = f.charAt(0);
            const fileName = f.substring(1).trim();
            const statusIcon = status === 'A' ? '➕' : status === 'M' ? '✏️' : status === 'D' ? '🗑️' : '📝';
            return `  - ${statusIcon} \`${fileName}\``;
          }).join('\n') + (files.length > 10 ? `\n  - ...他${files.length - 10}ファイル` : '')
        : '';
      
      // コミットメッセージが英語の場合は日本語化したバージョンも表示
      const displayMessage = commit.translatedMessage !== commit.message 
        ? `${commit.translatedMessage} (${commit.message})`
        : commit.message;
      
      history += `#### ${commit.category}: ${displayMessage}\n\n`;
      history += `- **作成者**: ${commit.author}\n`;
      history += `- **コミット**: \`${commit.hash}\`\n`;
      if (fileList) {
        history += `- **変更ファイル**:\n${fileList}\n`;
      }
      history += '\n';
    });
  });

  return history;
}

// 開発メンバー一覧を生成
function generateDevelopers(commits) {
  const developers = new Set();
  
  commits.forEach(commitLine => {
    const parts = commitLine.split('|');
    const author = parts[1]; // 2番目の要素が作成者
    if (author) {
      developers.add(author);
    }
  });

  if (developers.size === 0) {
    return '- プロジェクトメンバー情報はGitコミット履歴から自動的に取得されます';
  }

  return Array.from(developers).map(dev => `- **${dev}**`).join('\n');
}

// 要件定義書を更新
function updateRequirements() {
  console.log('📋 要件定義書を更新しています...\n');

  const lastUpdateTime = getLastUpdateTime();
  const commits = getCommitsSince(lastUpdateTime);

  if (commits.length === 0 && lastUpdateTime) {
    console.log('✅ 前回更新以降の変更はありません。');
    return;
  }

  // REQUIREMENTS.mdを読み込む（存在しない場合はテンプレートを使用）
  let requirementsContent;
  if (fs.existsSync(REQUIREMENTS_FILE)) {
    requirementsContent = fs.readFileSync(REQUIREMENTS_FILE, 'utf-8');
  } else {
    // 初回実行時はテンプレートを使用
    requirementsContent = `# 📋 要件定義書 - Smail Email Client

> **最終更新日**: 未更新
> **プロジェクト名**: Smail - Modern Email Client  
> **バージョン**: 1.0.0

---

## 📖 プロジェクト概要

Next.js + TypeScript + Tailwind CSSで構築されたモダンなメールクライアントアプリケーション。  
JWT認証とハイブリッドストレージ（MongoDB + ファイルシステム）を採用したセキュアなメール管理システム。

---

## 🎯 主な機能

### 認証機能
- ✅ ログイン/ログアウト
- ✅ JWT トークンベースの認証
- ✅ 認証ガードによる保護されたルート
- ✅ デモアカウント（\`demo@example.com\` / \`password\`）

### メール管理機能
- ✅ **受信トレイ** - 受信メールの一覧表示、未読/既読管理
- ✅ **送信済み** - 送信したメールの履歴
- ✅ **下書き** - 作成途中のメールを保存
- ✅ **メール作成** - 新規メールの作成と送信
- ✅ **迷惑メール** - スパムフィルタで検出されたメール
- ✅ **統計** - メール送受信の統計情報を視覚化

### UI/UX機能
- ✅ 赤・黄色・白を基調とした独自のカラーパレット
- ✅ リッチで使いやすいモダンなデザイン
- ✅ Inter + Noto Sans JP フォントによる読みやすい表示
- ✅ スムーズなグラデーションとホバーエフェクト
- ✅ レスポンシブなサイドバーナビゲーション

---

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15.5.3** - Reactフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - ユーティリティファーストCSS
- **shadcn/ui** - UIコンポーネントライブラリ
- **Radix UI** - アクセシブルなUIプリミティブ
- **Lucide React** - アイコンライブラリ
- **Axios** - HTTPクライアント

### バックエンド
- **Node.js** - サーバーランタイム
- **Express** - Webフレームワーク
- **MongoDB** - データベース
- **JWT** - 認証トークン
- **Bcrypt** - パスワードハッシュ化

---

## 📂 プロジェクト構造

\`\`\`
Mail-server/
├── app/                          # Next.js App Router
│   ├── (authenticated)/          # 認証が必要なページ
│   │   ├── inbox/                # 受信トレイ
│   │   ├── sent/                 # 送信済み
│   │   ├── drafts/               # 下書き
│   │   ├── compose/              # メール作成
│   │   ├── spam/                 # 迷惑メール
│   │   ├── statistics/           # 統計
│   │   └── layout.tsx            # 認証済みレイアウト
│   ├── login/                    # ログインページ
│   └── layout.tsx                # ルートレイアウト
├── components/                   # Reactコンポーネント
│   ├── ui/                       # shadcn/uiコンポーネント
│   ├── TopBar.tsx                # トップバー
│   ├── Sidebar.tsx               # サイドバー
│   ├── MailItem.tsx              # メールアイテム
│   └── AuthGuard.tsx             # 認証ガード
├── lib/                          # ユーティリティ
│   └── utils.ts                  # 共通関数
├── backend/                      # バックエンドサーバー
│   ├── server.js                 # Expressサーバー
│   ├── hybridMailService.js      # ハイブリッドメールサービス
│   ├── mongoMailService.js       # MongoDBメールサービス
│   └── twoFactorAuth.js          # 二段階認証
└── scripts/                      # スクリプト
    └── update-requirements.js    # 要件定義書更新スクリプト
\`\`\`

---

## 📝 変更履歴

### 未更新

要件定義書はまだ更新されていません。  
\`npm run update-requirements\` を実行するか、Cursor Chatで「更新」と入力して更新してください。

---

## 🚀 次のステップ

### 最重要
- [ ] 要件定義書の初回更新を実行

### 優先度：高
- [ ] 機能追加の検討
- [ ] パフォーマンス最適化

### 優先度：中
- [ ] テストコードの追加
- [ ] ドキュメントの充実

### 優先度：低
- [ ] UI/UXの改善
- [ ] アクセシビリティの向上

---

## 👥 開発メンバー

- プロジェクトメンバー情報はGitコミット履歴から自動的に取得されます

---

## 📌 注意事項

- この要件定義書は \`npm run update-requirements\` コマンドで自動更新されます
- 手動で編集する場合は、変更履歴セクションを適切に更新してください
- Gitで管理されているため、チーム全体で共有・更新できます
`;
    console.log('📄 REQUIREMENTS.mdが見つかりませんでした。テンプレートから作成します。\n');
  }

  // 最終更新日時を更新
  const updateTime = saveLastUpdateTime();
  const updateDate = new Date(updateTime).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 変更履歴セクションを置換
  const changeHistory = generateChangeHistory(commits);
  // 「未更新」セクションも含めて置換
  requirementsContent = requirementsContent.replace(
    /## 📝 変更履歴[\s\S]*?(?=## 🚀|## 👥|## 📌|$)/,
    `## 📝 変更履歴\n\n${changeHistory}\n\n---\n\n`
  );

  // 最終更新日時を更新
  requirementsContent = requirementsContent.replace(
    /> \*\*最終更新日\*\*: .*/,
    `> **最終更新日**: ${updateDate}`
  );

  // 開発メンバーセクションを更新
  const developers = generateDevelopers(commits);
  requirementsContent = requirementsContent.replace(
    /## 👥 開発メンバー[\s\S]*?(?=## |$)/,
    `## 👥 開発メンバー\n\n${developers}\n\n---\n\n`
  );

  // ファイルに書き込む
  fs.writeFileSync(REQUIREMENTS_FILE, requirementsContent, 'utf-8');

  console.log(`✅ 要件定義書を更新しました！`);
  console.log(`📅 更新日時: ${updateDate}`);
  console.log(`📊 処理したコミット数: ${commits.length}件\n`);
  
  if (commits.length > 0) {
    console.log('📝 主な変更内容:');
    commits.slice(-5).reverse().forEach(commitLine => {
      const [, author, , message] = commitLine.split('|');
      console.log(`  - ${message} (by ${author})`);
    });
  }
}

// メイン処理
try {
  updateRequirements();
} catch (error) {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
}

