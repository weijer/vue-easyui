import Vue from 'vue'
import App from './App.vue'
import easyui from './index.js'
import 'babel-polyfill'
Vue.use(easyui)
Vue.config.productionTip = false
new Vue({
  render: h => h(App),
}).$mount('#app')
