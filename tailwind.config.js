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
          text: '#1A1A1A',
          muted: '#4B5563',
          border: '#E5E7EB',
          surface: '#F9FAFB',
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
