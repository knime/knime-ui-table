const path = require('path');
const svgConfig = require('webapps-common/webpack/webpack.svg.config');
const LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin');

module.exports = {
    css: {
        extract: false
    },

    chainWebpack: config => {
        // allow tilde imports
        config.resolve.alias.set('~', path.resolve(__dirname));

        config.resolve.alias.set('webapps-common', path.resolve(__dirname, 'webapps-common'));

        // apply SVG loader config
        config.module.rule('svg').uses.clear();
        config.merge({ module: { rule: { svg: svgConfig } } });

        // needed to create static AP wrapper; already disabled for lib build
        config.optimization.delete('splitChunks');
        config.devtool('source-map'); // needed for IE11

        // rename Vue application
        config.output.set('filename', 'knime-pagebuilder2-ap.js');

        // remove hashes from font output
        config.module.rule('fonts').use('url-loader').tap(options => ({
            ...options,
            fallback: {
                ...options.fallback,
                options: {
                    name: 'fonts/[name].[ext]'
                }
            }
        }));

        // prevent multiple chunks
        config.plugin('LimitChunkCountPlugin').use(LimitChunkCountPlugin, [{ maxChunks: 1 }]);
    },
    // allow relative paths for serving font files in the AP
    publicPath: '',
    // required to override non-IE11 compliant package build settings
    transpileDependencies: ['v-calendar']
};
