import React from 'react';
import Loadable from 'react-loadable';
import { Route, Switch } from 'react-router-dom';
import { view as Loader } from '../../components/loader';
import Detail from './detail';
import Refund from './refund';
import RefundDetail from './refund/detail';
import Recharge from './recharge';
import Download from './download-list';

const Main = Loadable({
  loader: () => import('./main'),
  loading: Loader
});

export default class RouteApp extends React.Component {
  render() {
    const { match } = this.props;
    return (
      <Switch>
        <Route path={`${match.url}/recharge`} component={Recharge} />
        <Route path={`${match.url}/download`} component={Download} />
        <Route path={`${match.url}/detail/:id`} component={Detail} />
        <Route exact path={`${match.url}/refundOrder`} component={Refund} />
        <Route exact path={`${match.url}/refundOrder/:id/:sourceType?`} component={RefundDetail} />
        <Route path={`${match.url}`} component={Main} />
      </Switch>
    );
  }
}
