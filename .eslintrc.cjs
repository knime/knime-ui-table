// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    extends: ['@knime/eslint-config/vue3-typescript', '@knime/eslint-config/vitest'],
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
    rules: {
        'import/extensions': [
            'error',
            { vue: 'always', json: 'always', mjs: 'always', svg: 'always', config: 'ignorePackages' }
        ]
    },
    overrides: [
        {
            files: ['src/**/__tests__/**', 'test-setup/**'],
            rules: {
                'no-magic-numbers': 'off',
                'no-undefined': 'off',
                'import/extensions': [
                    'error',
                    { vue: 'always', json: 'always', mjs: 'always', svg: 'always', config: 'ignorePackages' }
                ]
            },
            env: {
                node: true
            }
        }
    ]
};
