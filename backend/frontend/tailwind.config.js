/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],

  daisyui: {
    themes: ["dracula", "night", "synthwave", "cyberpunk", "valentine", "aqua", "lofi", "fantasy"],
    darkTheme: "dracula",
  },
};

