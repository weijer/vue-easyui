const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  productionSourceMap: false,

  chainWebpack: config => {
    config.resolve.alias
    .set('vue$','vue/dist/vue.js')
    .set("@", resolve("src"))
    .set("assets", resolve("src/assets"))
    .set("components", resolve("src/components"))
    .set("public", resolve("public"));
  },
  assetsDir: 'static'
}