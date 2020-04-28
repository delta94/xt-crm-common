import React from 'react'
import { Route, Switch, RouteComponentProps } from 'react-router-dom'
import Store from './store'
import Goods from './goods'
import StoreForm from './store/form'
import Order from './order'
import Category from './category'
import Activity from './activity'
import MerchantAccounts from './merchant-accounts'
class Fresh extends React.Component<RouteComponentProps> {
  render () {
    const { match } = this.props
    return (
      <Switch>
        <Route path={`${match.url}/store`} component={Store} exact />
        <Route path={`${match.url}/goods`} component={Goods} />
        <Route path={`${match.url}/store/:id`} component={StoreForm} />
        <Route path={`${match.url}/order`} component={Order} />
        <Route path={`${match.url}/activity`} component={Activity} />
        <Route path={`${match.url}/category`} component={Category} />
        <Route path={`${match.url}/merchant-accounts`} component={MerchantAccounts} />
      </Switch>
    )
  }
}

export default Fresh