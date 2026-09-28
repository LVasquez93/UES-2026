/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f1b2d',        // texto principal / encabezados
        accent: '#0d7d6f',     // teal corporativo para acciones
        'accent-dark': '#0a5f55',
        surface: '#ffffff',
        page: '#eef1f4',       // fondo (gris azulado, no el cream típico)
        line: '#dde3ea',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
