// Development app launcher. Not included in production build.
import Vue from 'vue';
import c from 'consola';
import { logToConsole as enable, level } from '../logger.config';
import Demo from './Demo.vue';

window.consola = c.create({
    level: enable ? level : -1
});

Vue.config.productionTip = false;

new Vue({
    render: h => h(Demo)
}).$mount('#app');
