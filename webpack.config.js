/*
 * @Date: 2020-05-12 10:37:10
 * @LastEditors: fangbao
 * @LastEditTime: 2020-05-15 10:12:41
 * @FilePath: /eslint-plugin-xt-react/Users/fangbao/Documents/xituan/xt-react-template/webpack.config.js
 */

const path = require('path')
const webpack = require('webpack')
const pkg = require('./package.json')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CreateBuildConf = require('./plugins/createBuildConf')
const originConfig = {
  dev: 'http://daily-xt-crmadmin.hzxituan.com',
  test: 'https://test-crmadmin.hzxituan.com'
}

function getOrigin (env) {
  return originConfig[env]
}
module.exports = function (config, env) {
  const dev = env === 'dev'
  /** 构建时间 */
  const BUILD_TIME = new Date().getTime()
  // ignore verify
  config.module.rules = config.module.rules.filter((rule) => {
    return !(rule.enforce === 'pre' && (rule.test.test('.tsx') || rule.test.test('.jsx')))
  })
  const __ENV__ = process.env.NODE_ENV || 'dev'
  const branch = process.env.branch
  const app_name = process.env.app_name
  const origin = getOrigin(__ENV__)
  const publicPath = env === 'dev' ? '/' : `${origin}/${app_name}/${branch}/`
  
  config.output.publicPath = publicPath
  console.log(publicPath, 'publicPath')
  config.entry = {
    app: './src/index',
    // core: './src/core.tsx'
  }
  config.output.jsonpFunction = `xt-${pkg.name}`
  // config.plugins[0].options.publishTime = new Date().getTime()
  console.log(__ENV__, 'NODE_ENV')
  config.plugins.push(
    new webpack.DefinePlugin({
      BUILD_TIME: JSON.stringify(BUILD_TIME),
      __ENV__: JSON.stringify(__ENV__)
    })
  )
  config.plugins.push(
    new CreateBuildConf({
      build_time: BUILD_TIME
    })
  )
  config.plugins.push(
    new webpack.ProvidePlugin({
      APP: path.resolve(__dirname, 'src/util/app')
    })
  )
  // const outdir = 'build'
  // config.output.path = path.resolve(process.cwd(), outdir),
  config.module.rules.push({
    test: /\.(xls|xlsx)(\?.*)?$/,
    loader: 'url-loader',
    options: {
      limit: 0,
      name: env === 'dev' ? '' : 'assets/files/' + '[name].[hash:7].[ext]'
      // esModule: false,
      // encoding: false
    }
  })
  config.module.rules.push({
    test: /\.(scss|sass)$/,
    exclude: [
      /\.module\.(scss|sass)$/,
      /node_modules/
    ],
    use: [
      // Creates `style` nodes from JS strings
      'style-loader',
      // Translates CSS into CommonJS
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: dev,
          config: {
            path: path.resolve(__dirname, 'node_modules/xt-crm-cli/config/postcss.config.js'),
            ctx: {
              env: 'development'
            }
          }
        }
      },
      // Compiles Sass to CSS
      {
        loader: 'sass-loader'
      }
    ]
  })
  config.module.rules.push({
    test: /\.module\.(scss|sass)$/,
    exclude: /node_modules/,
    use: [
      // Creates `style` nodes from JS strings
      'style-loader',
      // Translates CSS into CommonJS
      {
        loader: 'css-loader',
        options: {
          modules: {
            mode: 'local'
          }
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: dev,
          config: {
            path: path.resolve(__dirname, 'node_modules/xt-crm-cli/config/postcss.config.js'),
            ctx: {
              env: 'development'
            }
          }
        }
      },
      // Compiles Sass to CSS
      {
        loader: 'sass-loader'
      }
    ]
  })
  // config.resolve.modules = [
  //   'node_modules'
  // ]
  console.log(env, 'env')
  // config.optimization.splitChunks = {
  //   splitChunks: {
  //     chunks: 'all',
  //   }
  // }
  config.optimization = {
    ...  config.optimization,
    splitChunks: {
      chunks: "all",
      minSize: 0,
      minChunks: 1,
      maxAsyncRequests: 10,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
            test: /node_modules/,
            name: 'vendors',
            chunks: 'all'
        }
      }
    }
  }
  if (env === 'prod') {
    config.plugins.push(new BundleAnalyzerPlugin({
      analyzerMode: 'static'
    }))
  }
  config.externals = {
    antd: 'antd',
    react: 'React',
    'react-dom': 'ReactDOM',
    imutable: 'Immutable',
    moment: 'moment',
    'ali-oss': 'OSS'
  }
  return config
}
