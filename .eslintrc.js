/*
 * @Date: 2020-04-08 14:12:51
 * @LastEditors: fangbao
 * @LastEditTime: 2020-05-21 14:44:20
 * @FilePath: /eslint-plugin-xt-react/Users/fangbao/Documents/xituan/xt-crm/.eslintrc.js
 */
module.exports = {
  extends: ['plugin:xt-react/recommended'],
  plugins: [],
  env: {
    jest: true
  },
  globals: {
    APP: true,
    Moon: true,
    BUILD_TIME: true
  },
  rules: {
    'react/prop-types': 1
  },
  parserOptions: {
    project: 'tsconfig.json',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
};
