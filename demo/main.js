// Development app launcher. Not included in production build.
import { createApp } from 'vue';
import consola from 'consola';
import MyDemo from './MyDemo.vue';

window.consola = consola.create({
    level: import.meta.env.KNIME_LOG_TO_CONSOLE ? import.meta.env.KNIME_LOG_LEVEL : -1
});

const app = createApp(MyDemo);
app.mount('#app');
