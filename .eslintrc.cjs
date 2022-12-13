// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    extends: ['@knime/eslint-config/vue3-typescript'],
    globals: {
        consola: true
    },
    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@', 'src/.']
                ]
            }
        }
    },
    overrides: [
        {
            extends: ['@knime/eslint-config/jest'],
            files: ['src/**/__tests__/**', 'test-setup/**'],
            rules: {
                'no-magic-numbers': 'off',
                'import/extensions': [
                    'error',
                    { vue: 'always', json: 'always', mjs: 'always', svg: 'always', config: 'ignorePackages' }
                ]
            }
        }
    ]
};
