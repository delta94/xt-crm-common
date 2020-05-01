/*
 * @Date: 2020-03-06 10:18:13
 * @LastEditors: fangbao
 * @LastEditTime: 2020-03-06 14:37:04
 * @FilePath: /xt-crm/src/pages/fresh/goods/index.js
 */
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import loadable from '@/util/loadable'
import GoodsTimer from './timer'

const SkuSale = loadable(() => import('./sku-sale'));
const Check = loadable(() => import('./check'));
const Detail = loadable(() => import('./detail'));
const GoodsForm = loadable(() => import('./sku-sale/form'));
export default class RouteApp extends React.Component {
  render() {
    const { match } = this.props;
    return (
      <Switch>
        <Route exact path={`${match.url}`} component={SkuSale} />
        <Route path={`${match.url}/list`} component={SkuSale} />
        <Route path={`${match.url}/timer`} component={GoodsTimer} />
        <Route path={`${match.url}/check`} component={Check} />
        <Route path={`${match.url}/sku-sale/:id`} component={GoodsForm} />
        <Route path={`${match.url}/detail/:id?`} component={Detail} />
      </Switch>
    );
  }
}
