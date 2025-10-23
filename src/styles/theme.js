export const colors = {
  // メインカラー - 日本風モダンパレット
  primary: '#3B82F6',        // ブライトブルー
  primaryLight: '#60A5FA',   // ライトブルー
  primaryDark: '#2563EB',    // ダークブルー
  
  secondary: '#8B5CF6',      // ソフトパープル
  secondaryLight: '#A78BFA', // ライトパープル
  secondaryDark: '#7C3AED',  // ダークパープル
  
  // ステータスカラー
  success: '#10B981',        // エメラルドグリーン
  successLight: '#34D399',   // ライトグリーン
  warning: '#F59E0B',        // アンバー
  warningLight: '#FBBF24',   // ライトアンバー
  error: '#EF4444',          // レッド
  errorLight: '#F87171',     // ライトレッド
  info: '#3B82F6',           // インフォブルー
  
  // 背景カラー
  background: '#F8FAFC',     // クールグレー背景
  backgroundDark: '#1E293B', // ダークモード背景
  surface: '#FFFFFF',        // カード表面
  surfaceHover: '#F1F5F9',   // ホバー時
  
  // テキストカラー
  text: '#1F2937',           // メインテキスト
  textLight: '#6B7280',      // セカンダリテキスト
  textDark: '#111827',       // 濃いテキスト
  placeholder: '#9CA3AF',    // プレースホルダー
  
  // ボーダー・区切り線
  border: '#E5E7EB',         // ライトボーダー
  borderDark: '#374151',     // ダークボーダー
  divider: '#E5E7EB',        // 区切り線
  
  // その他
  disabled: '#D1D5DB',       // 無効状態
  hover: '#F3F4F6',          // ホバー背景
  shadow: 'rgba(0, 0, 0, 0.1)', // シャドウ
  accent: '#8B5CF6',         // アクセントカラー
  
  // Android対応
  ripple: 'rgba(59, 130, 246, 0.2)', // リップルエフェクト
  androidSurface: 'rgba(255, 255, 255, 0.95)',
  androidDivider: 'rgba(229, 231, 235, 0.8)',
};

export const fonts = {
  regular: 'System',
  medium: 'System',
  light: 'System',
  thin: 'System',
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
  
  // Android-specific spacing
  androidSmall: 8,
  androidMedium: 16,
  androidLarge: 24,
  androidXLarge: 32,
  androidListItem: 72,    // Standard Android list item height
  androidTouch: 48,       // Minimum touch target size
};

export const borderRadius = {
  small: 6,
  medium: 12,
  large: 20,
  
  // Android-specific border radius
  androidSmall: 4,
  androidMedium: 8,
  androidLarge: 16,
  androidCard: 12,        // Material Design card radius
  androidButton: 8,       // Material Design button radius
  androidFab: 28,         // Floating Action Button radius
};

// Default theme export for react-native-paper
export const theme = {
  colors,
  fonts,
  spacing,
  borderRadius,
};