import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import Category from './category'
import Hotkey from './hotkey'
import HomeIcon from './home-icon'
import Special from './special'
import SpecialDetail from './special/Detail'
import HomeConfig from './config'
import FreeSubsidies from './free-subsidies'
import SpecialContent from './special/content'
import SpecialContentForm from './special/content/form'
import GoodsRecommend from './goods-recommend'
import GoodsRecommendDetail from './goods-recommend/Detail'
export default class extends Component {
  render() {
    return (
      <Switch>
        <Route path='/interface/category' component={Category} />
        <Route path='/interface/hotkey' component={Hotkey} />
        <Route path='/interface/home-icon' component={HomeIcon} />
        <Route path='/interface/special' exact component={Special} />
        <Route path='/interface/special/:id' component={SpecialDetail} />
        <Route path='/interface/config' component={HomeConfig} />
        <Route path='/interface/free' component={FreeSubsidies} />
        <Route path='/interface/special-content' exact component={SpecialContent} />
        <Route path='/interface/special-content/:id' exact component={SpecialContentForm} />
        <Route path='/interface/goods-recommend' exact component={GoodsRecommend} />
        <Route path='/interface/goods-recommend/:id' component={GoodsRecommendDetail} />
      </Switch>
    )
  }
}