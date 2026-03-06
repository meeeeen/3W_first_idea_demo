/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── 배경 레이어
        bg:       '#080c0a',
        surface:  '#0f1510',
        card:     '#131a14',
        card2:    '#161e17',
        // ── 액센트
        accent:   '#00e5a0',
        'accent-dim': '#00b87a',
        // ── 텍스트
        cream:    '#eef5f0',
        muted:    '#6b7c70',
        'muted-light': '#9bb0a0',
        // ── 상태 컬러
        risk: {
          low:  '#00e5a0',
          mid:  '#ffd740',
          high: '#ff9a3c',
          crit: '#ff4d4d',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.18em',
        widest3: '0.2em',
      },
      gridTemplateColumns: {
        'emp-table': '36px 1fr 90px 95px 1fr 80px',
        'dash':      '1fr 380px',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.2 },
        },
        fadeSlideIn: {
          from: { opacity: 0, transform: 'translateY(5px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        blink:       'blink 2s infinite',
        blinkFast:   'blink 0.7s infinite',
        fadeSlideIn: 'fadeSlideIn 0.25s ease',
      },
    },
  },
  plugins: [],
};
