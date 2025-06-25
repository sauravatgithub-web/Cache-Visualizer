const scrollbarHide = require('tailwind-scrollbar-hide');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        md: '0.375rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ]
}
