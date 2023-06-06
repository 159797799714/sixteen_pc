'use strict'
const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'

// 默认情况下不启用它们，因为它们会导致运行时的额外开销，并增加了 bundle 大小
//  (JS source map 不会)
const sourceMapEnabled = isProduction ?
    config.build.productionSourceMap :
    config.dev.cssSourceMap

// 管理loader配置的文件
module.exports = {

    loaders: utils.cssLoaders({
        sourceMap: sourceMapEnabled,
        // 如果是产品模式 则将css从vue中提取出来
        extract: false,
    }),
    cssSourceMap: sourceMapEnabled,
    cacheBusting: config.dev.cacheBusting,
    transformToRequire: {
        video: ['src', 'poster'],
        source: 'src',
        img: 'src',
        image: 'xlink:href'
    }
}
