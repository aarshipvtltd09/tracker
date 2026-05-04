/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        success: '#10B981',
        pending: '#F59E0B',
        critical: '#EF4444',
        background: '#0B0F19',
      },
      borderRadius: {
        'card': '24px',
        'button': '14px',
      },
      boxShadow: {
        'soft': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
