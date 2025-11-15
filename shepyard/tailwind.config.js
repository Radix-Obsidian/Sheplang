/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vscode: {
          bg: '#1E1E1E',
          fg: '#D4D4D4',
          sidebar: '#252526',
          activityBar: '#333333',
          panel: '#181818',
          statusBar: '#007ACC',
          border: '#3E3E3E',
          selection: '#264F78',
          hover: '#2A2D2E',
          active: '#094771',
          tabInactive: '#2D2D30',
          input: '#3C3C3C',
          button: '#0E639C',
          buttonHover: '#1177BB',
          error: '#F48771',
          warning: '#CCA700',
          info: '#3794FF',
          success: '#89D185',
        }
      },
      fontFamily: {
        mono: ['Cascadia Code', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
