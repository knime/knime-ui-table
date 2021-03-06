module.exports = {
    moduleFileExtensions: [
        'js',
        'jsx',
        'json',
        'vue'
    ],
    transform: {
        '\\.js$': 'babel-jest',
        '\\.vue$': 'vue-jest',
        '\\.(css|styl|less|sass|scss|ttf|woff|woff2)(\\?|$)': 'jest-transform-stub',
        '\\.svg': '<rootDir>/test/unit/jest-transform-svgs',
        '\\.(jpg|webp)': '<rootDir>/test/unit/jest-file-loader'
    },
    transformIgnorePatterns: [
        '/node_modules/'
    ],
    moduleNameMapper: {
        '\\.(jpg|png)\\?(jpg|webp)': '<rootDir>/test/unit/assets/stub.$2',
        '^@/(.*\\.svg)\\?inline$': '<rootDir>/src/$1',
        '^~/(.*\\.svg)\\?inline$': '<rootDir>/$1',
        '^(.*\\.svg)\\?inline$': '$1',
        '\\.svg\\?data$': '<rootDir>/test/unit/assets/stub.data',
        '^vue$': 'vue/dist/vue.common.js',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^~/(.*)$': '<rootDir>/$1'
    },
    reporters: ['default', ['jest-junit', { outputDirectory: './coverage' }]],
    coverageReporters: ['lcov', 'text'],
    // keep in sync with pom.xml sonar settings!
    collectCoverageFrom: [
        '<rootDir>/**/*.{js,vue}',
        '!config.js',
        '!**/*.config.js',
        '!.eslintrc*.js',
        '!**/.eslintrc*.js',
        '!buildtools/**/*.js',
        '!.stylelintrc.js',
        '!demo/**/*',
        '!index.js'
    ],
    coveragePathIgnorePatterns: [
        '^<rootDir>/(coverage|dist|target|node_modules|webapps-common|test)/'
    ],
    watchPathIgnorePatterns: [
        '^<rootDir>/(coverage|dist|target|node_modules|webapps-common)/'
    ],
    testMatch: [
        '<rootDir>/test/unit/**/*.test.js'
    ],
    setupFiles: ['<rootDir>/test/unit/jest-setup']
};
