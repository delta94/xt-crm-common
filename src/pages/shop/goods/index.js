import React from 'react';
import { Card, Tabs } from 'antd';
import { getGoodsList, getCategoryTopList, passGoods } from './api';
import SelectFetch from '@/components/select-fetch';
import { ListPage, FormItem } from '@/packages/common/components';
import SuppilerSelect from '@/components/suppiler-auto-select';
import CarouselModal from './components/carouselModal';
import UnpassModal from './components/unpassModal';
import LowerModal from './components/lowerModal';
import ViolationModal from './components/violationModal';
import { statusList, formConfig } from './config/config';
import getColumns from './config/columns';

const { TabPane } = Tabs;

class Main extends React.Component {

  state = {
    status: 0, // 当期tab切换状态
    currentGoods: null // 当前审核商品
  }

  /** 操作：商品图片预览-显示预览模态框 */
  handlePreview = (currentGoods) => {
    this.setState({
      currentGoods
    }, () => {
      this.carouselModalRef.showModal()
    })
  }

  /** 操作：查看商品违规次数-显示违规模态框 */
  handleViolation = (currentGoods) => {
    this.setState({
      currentGoods
    }, () => {
      this.violationModalRef.showModal()
    })
  }

  /** 操作：查看商品详情-打开新标签页面 */
  handleDetail = (record) => {
    window.open(`/#/shop/goods/detail/${record.id}`);
  }

  /** 操作：下架商品-显示下架理由模态框 */
  handleLower = (currentGoods) => {
    this.setState({
      currentGoods
    }, () => {
      this.lowerModalRef.showModal()
    })
  }

  /** 操作：通过商品审核 */
  handlePass = (record) => {
    const params = record.id
    passGoods(params).then(() => {
      this.listRef.fetchData()
    })
  }

  /** 操作：不通过商品审核-弹出理由模态框 */
  handleUnpass = (currentGoods) => {
    this.setState({
      currentGoods
    }, () => {
      this.unpassModalRef.showModal()
    })
  }

  /** 操作：切换状态查询 */
  handleTabChange = (key) => {
    this.setState({
      status: +key
    }, () => {
      this.listRef.refresh();
    })
  }

  /** 性能优化: 重置清空当前商品 */
  handleDestroy = () => {
    this.setState({
      currentGoods: null
    })
  }

  render() {
    const { status, currentGoods } = this.state;

    return (
      <Card>
        {/* 商品图片预览模态框 */}
        <CarouselModal
          currentGoods={currentGoods}
          ref={ref => this.carouselModalRef = ref}
          ondestroy={this.handleDestroy}
        />

        {/* 不通过理由模态框 */}
        <UnpassModal
          currentGoods={currentGoods}
          listRef={this.listRef}
          wrappedComponentRef={ref => this.unpassModalRef = ref}
          ondestroy={this.handleDestroy}
        />

        {/* 下架操作模态框 */}
        <LowerModal
          currentGoods={currentGoods}
          listRef={this.listRef}
          wrappedComponentRef={ref => this.lowerModalRef = ref}
          ondestroy={this.handleDestroy}
        />

        {/* 违规历史模态框 */}
        <ViolationModal
          currentGoods={currentGoods}
          ref={ref => this.violationModalRef = ref}
          ondestroy={this.handleDestroy}
        />

        {/* Tabs状态切换组 */}
        <Tabs
          defaultActiveKey='0'
          onChange={this.handleTabChange}
        >
          {
            statusList.map(item => <TabPane tab={item.name} key={item.id} />)
          }
        </Tabs>

        {/* 列表内容: 查询条件 + 表格内容 */}
        <ListPage
          reserveKey='/shop/goods'
          namespace='/shop/goods'
          formConfig={formConfig}
          getInstance={ref => this.listRef = ref}
          processPayload={(payload) => {
            return {
              ...payload,
              status: this.state.status
            }
          }}
          rangeMap={{
            goodsTime: {
              fields: ['createStartTime', 'createEndTime']
            },
            optionTime: {
              fields: ['modifyStartTime', 'modifyEndTime']
            }
          }}
          formItemLayout={(
            <>
              <FormItem name='productName' />
              <FormItem name='productId' />
              <FormItem
                label='一级类目'
                inner={(form) => {
                  return form.getFieldDecorator('categoryId')(
                    <SelectFetch
                      style={{ width: 172 }}
                      fetchData={getCategoryTopList}
                    />
                  )
                }}
              />
              <FormItem
                label='供应商'
                inner={(form) => {
                  return form.getFieldDecorator('storeId')(
                    <SuppilerSelect style={{ width: 172 }} />
                  );
                }}
              />
              <FormItem name='auditStatus' />
              <FormItem label="审核人" name="auditUser" />
              <FormItem
                name="createTime"
                label="创建时间"
                type="rangepicker"
                controlProps={{
                  showTime: true,
                }}
              />
              <FormItem
                label="审核时间"
                name="auditTime"
                type="rangepicker"
                controlProps={{
                  showTime: true,
                }}
              />
              <FormItem name='phone' />
            </>
          )}
          api={getGoodsList}
          columns={getColumns({
            status,
            onPreview: this.handlePreview,
            onViolation: this.handleViolation,
            onDetail: this.handleDetail,
            onLower: this.handleLower,
            onPass: this.handlePass,
            onUnpass: this.handleUnpass
          })}
          tableProps={{
            scroll: {
              x: true
            }
          }}
        />
      </Card>
    )
  }
}

export default Main;