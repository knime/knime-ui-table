const TestUtils = require('@vue/test-utils');

require('consola');

TestUtils.config.stubs['nuxt-link'] = TestUtils.RouterLinkStub;
TestUtils.config.stubs['client-only'] = '<div><slot /></div>';

process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line no-undef
    fail(err);
});
