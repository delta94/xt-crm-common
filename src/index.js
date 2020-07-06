/*
 * @Date: 2020-03-27 11:00:32
 * @LastEditors: fangbao
 * @LastEditTime: 2020-06-02 11:57:58
 * @FilePath: /eslint-plugin-xt-react/Users/fangbao/Documents/xituan/xt-crm/src/index.js
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import 'url-search-params-polyfill'
import App from './App'
import './assets/css/common.scss'
import 'viewerjs/dist/viewer.css'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { init } from '@rematch/core'
import createLoadingPlugin from '@rematch/loading'
import models from './model-store'
import ErrorBoundary from '@/components/error-boundary'
import './util/moon'
moment.locale('zh-cn')

const loading = createLoadingPlugin()
const store = init({
  models,
  plugins: [loading]
})

ReactDOM.render(
  <ErrorBoundary>
    <ConfigProvider
      locale={zh_CN}
      /*
       * getPopupContainer={node => {
       *   if (node) {
       *     return node.parentNode;
       *   }
       *   return document.body;
       * }}
       */
    >
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>
    </ConfigProvider>
  </ErrorBoundary>,
  document.getElementById('root')
)

document.addEventListener('DOMContentLoaded', event => {
  document.querySelector('#root').addEventListener('click', function (e) {
    const target = e.target
    if (target.tagName === 'BUTTON' && (' ' + target.className + '  ').indexOf(' xt-delay ') > -1) {
      const disabled = target.getAttribute('data-disabled')
      if (disabled) {
        e.stopPropagation()
      } else {
        target.setAttribute('data-disabled', true)
        setTimeout(function () {
          target.setAttribute('data-disabled', '')
        }, 1000)
      }
    }
  })
})