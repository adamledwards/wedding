module.exports = ctx => ({
  plugins: [
    require('postcss-import'),
    require('postcss-preset-env'),
    require('autoprefixer'),
    require("postcss-color-function"),
    require('postcss-nested'),
    // require('postcss-font-magician')({
    //   hosted: {
    //     fonts: ['./src/assets/fonts', '../fonts/'],
    //   },
    // }),
    require('cssnano'),
    require('lost'),
  ],
})
