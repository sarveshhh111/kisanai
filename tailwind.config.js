/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        kisan: {
          green: '#1A7A4A',
          dark: '#0F5C35',
          light: '#E8F5EE',
          mint: '#25A866',
          deep: '#073B25',
          glow: '#DDF8EA',
        },
        agri: {
          teal: '#0F766E',
          lime: '#84CC16',
          gold: '#F6B84B',
          cream: '#FFF8E7',
          ink: '#10231A',
          card: '#FFFFFF',
        },
        alert: {
          amber: '#D97706',
          amberBg: '#FEF9E8',
        },
        price: {
          red: '#DC2626',
          green: '#16A34A',
        },
        sky: {
          blue: '#185FA5',
          blueBg: '#EAF4FE',
        },
        theme: {
          text: '#10231A',
          muted: '#53655B',
          border: '#DDE7E0',
          surface: '#F3F7F1',
          tertiary: '#9CA3AF',
        },
        // Aliases used across screens
        'leaf-light': '#E8F5EE',
        'mint-fresh': '#25A866',
        'amber-bg': '#FEF9E8',
      },
      fontFamily: {
        sans: ['NotoSans_400Regular', 'sans-serif'],
        medium: ['NotoSans_500Medium', 'sans-serif'],
        bold: ['NotoSans_600SemiBold', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
