/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 日本風のモダンなカラーパレット
        primary: {
          DEFAULT: '#3B82F6', // ブルー
          light: '#60A5FA',
          dark: '#2563EB',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // パープル
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        success: '#10B981', // グリーン
        warning: '#F59E0B', // オレンジ
        danger: '#EF4444',  // レッド
        info: '#3B82F6',    // ブルー
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#1E293B',
          card: '#FFFFFF',
        },
        text: {
          DEFAULT: '#1F2937',
          light: '#6B7280',
          dark: '#111827',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#374151',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        mono: ['monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
