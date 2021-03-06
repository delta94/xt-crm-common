import React, { Component } from 'react';
import { view as XHeader } from '@/components/header';
import { view as Sidebar } from '@/components/sidebar';
import { Layout, message } from 'antd';
import { connect } from '@/util/utils';
import * as LocalStorage from '@/util/localstorage';

const { Content, Header } = Layout;

let unlisten = null;

@connect(state => ({
  tree: state.layout.tree
  // permissionUrlList: state.layout.permissionUrlList
}))
export default class extends Component {
  constructor(props) {
    super(props);
    const { history } = this.props;
    const {
      location: { pathname }
    } = history;
    this.state = {
      collapsed: false,
      prePathName: pathname,
      mwidth: 200,
      hasPermission: false
    };
  }

  componentDidMount() {
    const { history } = this.props;
    this.gotoAuth(history.location.pathname);
    unlisten = history.listen(() => {
      const {
        location: { pathname }
      } = history;
      const { prePathName } = this.state;
      if (pathname !== prePathName) {
        this.setState(
          {
            prePathName: pathname
          },
          () => {
            this.gotoAuth(pathname);
          }
        );
      }
    });
    this.getMenuList();
  }

  getMenuList = () => {
    const user = LocalStorage.get('user') || [];
    const { dispatch } = this.props;
    dispatch['layout'].getMenuList(user);
  };

  gotoAuth = pathname => {
    const user = LocalStorage.get('user') || {};
    if (!user.id) {
      message.info('未登录');
      this.props.history.push('/login');
      return;
    }
  };

  setCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      mwidth: this.state.collapsed ? 200 : 80
    });
  };

  logout = () => {
    LocalStorage.clear();
    message.success('退出成功');
  };

  componentWillUnmount() {
    unlisten();
  }

  render() {
    const { collapsed, mwidth } = this.state;
    const pathname = this.props.location.pathname;
    return (
      <Layout>
        <Sidebar collapsed={collapsed} data={this.props.tree} pathname={pathname} />
        <Layout style={{ marginLeft: mwidth, overflow: 'auto', height: '100vh' }}>
          <div style={{ minWidth: '1200px' }}>
            <Header>
              <XHeader collapsed={collapsed} setCollapsed={this.setCollapsed} logout={this.logout} />
            </Header>
            {true ? <Content style={{ margin: 20 }}>{this.props.children}</Content> : '暂无权限'}
          </div>
        </Layout>
      </Layout>
    );
  }
}
