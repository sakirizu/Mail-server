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

// 変更内容を分類
function categorizeChange(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('add') || lowerMessage.includes('追加') || lowerMessage.includes('新規')) {
    return '機能追加';
  } else if (lowerMessage.includes('fix') || lowerMessage.includes('修正') || lowerMessage.includes('bug')) {
    return 'バグ修正';
  } else if (lowerMessage.includes('update') || lowerMessage.includes('更新') || lowerMessage.includes('変更')) {
    return '更新';
  } else if (lowerMessage.includes('refactor') || lowerMessage.includes('リファクタ')) {
    return 'リファクタリング';
  } else if (lowerMessage.includes('remove') || lowerMessage.includes('削除') || lowerMessage.includes('clean')) {
    return '削除・整理';
  } else if (lowerMessage.includes('docs') || lowerMessage.includes('ドキュメント') || lowerMessage.includes('readme')) {
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
    '更新': [],
    'リファクタリング': [],
    '削除・整理': [],
    'ドキュメント': [],
    'その他': []
  };

  // コミットを分類
  commits.forEach(commitLine => {
    const [hash, author, date, message] = commitLine.split('|');
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
      
      history += `#### ${commit.category}: ${commit.message}\n\n`;
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
    const [, author] = commitLine.split('|');
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

  // REQUIREMENTS.mdを読み込む
  let requirementsContent = fs.readFileSync(REQUIREMENTS_FILE, 'utf-8');

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

