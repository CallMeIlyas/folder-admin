/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        pacifico: ['Pacifico', 'cursive'],
        nataliecaydence: ['Nataliecaydence-regular', 'cursive'],
        // Poppins Variants
        poppinsThin: ['Poppins-Thin', 'sans-serif'],
        poppinsThinItalic: ['Poppins-ThinItalic', 'sans-serif'],
        poppinsExtraLight: ['Poppins-ExtraLight', 'sans-serif'],
        poppinsExtraLightItalic: ['Poppins-ExtraLightItalic', 'sans-serif'],
        poppinsLight: ['Poppins-Light', 'sans-serif'],
        poppinsLightItalic: ['Poppins-LightItalic', 'sans-serif'],
        poppinsRegular: ['Poppins-Regular', 'sans-serif'],
        poppinsItalic: ['Poppins-Italic', 'sans-serif'],
        poppinsMedium: ['Poppins-Medium', 'sans-serif'],
        poppinsMediumItalic: ['Poppins-MediumItalic', 'sans-serif'],
        poppinsSemiBold: ['Poppins-SemiBold', 'sans-serif'],
        poppinsSemiBoldItalic: ['Poppins-SemiBoldItalic', 'sans-serif'],
        poppinsBold: ['Poppins-Bold', 'sans-serif'],
        poppinsBoldItalic: ['Poppins-BoldItalic', 'sans-serif'],
        poppinsBlack: ['Poppins-Black', 'sans-serif'],
        poppinsBlackItalic: ['Poppins-BlackItalic', 'sans-serif'],
      },
      colors: {
        'pink-custom': '#dcbec1',
      },
    },
  },
  plugins: [],
}