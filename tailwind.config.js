/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/screen/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'background': '#ffff', // Corrected color key
      },
     
    },
  },
  plugins: [],
};
