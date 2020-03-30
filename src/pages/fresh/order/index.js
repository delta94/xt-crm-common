import React from 'react';
import Loadable from 'react-loadable';
import { Route, Switch } from 'react-router-dom';
import { view as Loader } from '@/components/loader';
import Detail from './detail';

const Main = Loadable({
  loader: () => import('./main'),
  loading: Loader
});

export default class RouteApp extends React.Component {
  render() {
    const { match } = this.props;
    return (
      <Switch>
        <Route path={`${match.url}/detail/:id`} component={Detail} />
        <Route path={`${match.url}`} component={Main} />
      </Switch>
    );
  }
}