module.exports = {
    extends: ['../../webapps-common/lint/.eslintrc-jest.js'],
    env: {
        node: true
    },
    rules: {
        'no-magic-numbers': 'off'
    }
};
