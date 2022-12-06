// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    globals: {
        consola: true
    },
    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@', '.']
                ]
            }
        }
    },
    overrides: [
        {
            files: ['**/__tests__/**', 'test-setup/**'],
            rules: {
                'no-magic-numbers': 'off'
            }
        }
    ]
};
