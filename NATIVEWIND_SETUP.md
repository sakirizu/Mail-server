# NativeWind セットアップガイド

このプロジェクトでNativeWind（React NativeでTailwind CSSを使用）をセットアップする手順です。

## 📦 インストール

プロジェクトのルートディレクトリで以下のコマンドを実行してください：

```bash
npm install
```

または、個別にインストールする場合：

```bash
npm install nativewind tailwindcss
npm install --save-dev @types/react-native
```

## 📁 作成されたファイル

### 1. `tailwind.config.js`
Tailwind CSSの設定ファイル。日本風のモダンなカラーパレットを含みます。

### 2. `nativewind-env.d.ts`
TypeScript用の型定義ファイル。

### 3. `babel.config.js`
NativeWindのBabelプラグインを追加済み。

## 🎨 カラーパレット

日本風のモダンなデザインシステム：

- **Primary**: ブライトブルー (#3B82F6)
- **Secondary**: ソフトパープル (#8B5CF6)
- **Success**: エメラルドグリーン (#10B981)
- **Warning**: アンバー (#F59E0B)
- **Error**: レッド (#EF4444)

## 🚀 使用方法

### 基本的な使い方

```jsx
import { View, Text } from 'react-native';

export default function MyComponent() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-2xl font-bold text-blue-500">
        こんにちは！
      </Text>
    </View>
  );
}
```

### よく使うクラス

#### レイアウト
- `flex-1` - フレックス: 1
- `items-center` - 中央揃え（横）
- `justify-center` - 中央揃え（縦）
- `flex-row` - 横並び

#### スペーシング
- `p-4` - パディング: 16px
- `px-6` - 左右パディング: 24px
- `py-3` - 上下パディング: 12px
- `m-4` - マージン: 16px
- `mb-2` - 下マージン: 8px

#### テキスト
- `text-base` - フォントサイズ: 16px
- `text-lg` - フォントサイズ: 18px
- `text-2xl` - フォントサイズ: 24px
- `font-bold` - 太字
- `text-center` - 中央揃え
- `text-gray-900` - テキスト色: ダークグレー

#### 背景色
- `bg-white` - 白
- `bg-gray-50` - 薄いグレー
- `bg-blue-500` - ブルー
- `bg-red-500` - レッド

#### ボーダー
- `rounded` - 角丸: 4px
- `rounded-lg` - 角丸: 8px
- `rounded-2xl` - 角丸: 16px
- `border` - ボーダー: 1px
- `border-gray-300` - ボーダー色: グレー

#### シャドウ
- `shadow` - 基本シャドウ
- `shadow-lg` - 大きなシャドウ

## 📝 例：モダンなボタン

```jsx
<TouchableOpacity 
  className="bg-blue-500 px-6 py-3 rounded-lg shadow-md"
  onPress={() => console.log('押された！')}
>
  <Text className="text-white text-center font-semibold">
    送信する
  </Text>
</TouchableOpacity>
```

## 📝 例：カード

```jsx
<View className="bg-white rounded-2xl shadow-lg p-6 m-4">
  <Text className="text-xl font-bold text-gray-900 mb-2">
    タイトル
  </Text>
  <Text className="text-gray-600">
    カードの内容がここに表示されます。
  </Text>
</View>
```

## 🔧 トラブルシューティング

### キャッシュをクリア

```bash
npx expo start -c
```

### パッケージを再インストール

```bash
rm -rf node_modules
npm install
```

## 📚 参考リンク

- [NativeWind 公式ドキュメント](https://www.nativewind.dev/)
- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs)

## ✨ 次のステップ

1. `src/screens/LoginScreenModern.js` を確認してNativeWindの使用例を見る
2. 既存のコンポーネントにTailwind CSSクラスを追加する
3. `tailwind.config.js` でカスタムカラーやスペーシングを追加する

Happy Coding! 🎉
