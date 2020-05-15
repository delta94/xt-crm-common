import React from 'react'
import { Card, Tabs, Button, Modal, message, Row } from 'antd'
import dateFns from 'date-fns'
import {
  getGoodsList,
  delGoodsDisable,
  enableGoods,
  exportFileList,
  getCategoryTopList,
  upByGoodsId,
  cancelUpByGoodsId
} from '../api'
import { gotoPage, replaceHttpUrl } from '@/util/utils'
import Image from '@/components/Image'
import SelectFetch from '@/components/select-fetch'
import { If, ListPage, FormItem } from '@/packages/common/components'
import { ListPageInstanceProps } from '@/packages/common/components/list-page'
import SuppilerSelect from '@/components/suppiler-auto-select'
import { defaultConfig } from './config'
import TabItem from './TabItem'
const { TabPane } = Tabs

interface SkuSaleListState {
  selectedRowKeys: string[] | number[];
  status: number;
}

class SkuSaleList extends React.Component<any, SkuSaleListState> {
  state: SkuSaleListState = {
    selectedRowKeys: [],
    status: 0
  };
  list: ListPageInstanceProps;
  columns = [
    {
      title: '商品ID',
      width: 120,
      dataIndex: 'id'
    },
    {
      title: '商品主图',
      dataIndex: 'coverUrl',
      width: 120,
      render: (record: any) => (
        <Image
          style={{
            height: 100,
            width: 100,
            minWidth: 100
          }}
          src={replaceHttpUrl(record)}
          alt='主图'
        />
      )
    },
    {
      title: '商品名称',
      width: 120,
      dataIndex: 'productName'
    },
    {
      title: '类目',
      width: 120,
      dataIndex: 'firstCategoryName'
    },
    {
      title: '成本价',
      width: 100,
      dataIndex: 'costPrice',
      render: APP.fn.formatMoney
    },
    {
      title: '销售价',
      width: 100,
      dataIndex: 'salePrice',
      render: APP.fn.formatMoney
    },
    {
      title: '库存',
      width: 100,
      dataIndex: 'stock'
    },
    {
      title: '累计销量',
      width: 100,
      dataIndex: 'saleCount'
    },
    {
      title: '供应商',
      width: 120,
      dataIndex: 'storeName'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 200,
      render: (record: any) => (
        <>{dateFns.format(record, 'YYYY-MM-DD HH:mm:ss')}</>
      )
    },
    {
      title: '最后操作时间',
      dataIndex: 'modifyTime',
      width: 200,
      render: (record: any) => (
        <>{dateFns.format(record, 'YYYY-MM-DD HH:mm:ss')}</>
      )
    },
    {
      title: '操作',
      fixed: 'right',
      align: 'center',
      width: 180,
      render: (record: any) => {
        const { status } = this.state
        return (
          <div>
            <If condition={status === 0 && record.top === 0}>
              <span className='href' onClick={this.up.bind(this, record.id)}>
                置顶
              </span>
            </If>
            <If condition={status === 0 && record.top === 1}>
              <span
                className='href'
                onClick={this.cancelUp.bind(this, record.id)}
              >
                取消置顶
              </span>
            </If>
            <span
              className='href ml10'
              onClick={() => {
                gotoPage(`/fresh/goods/sku-sale/${record.id}`)
              }}
            >
              编辑
            </span>
            <If condition={status === 0}>
              <span
                className='href ml10'
                onClick={() => this.lower([record.id])}
              >
                下架
              </span>
            </If>
            <If condition={status === 1}>
              <span
                className='href ml10'
                onClick={() => this.upper([record.id])}
              >
                上架
              </span>
            </If>
          </div>
        )
      }
    }
  ];

  /** 下架商品 */
  lower = (ids: string[] | number[]) => {
    Modal.confirm({
      title: '下架提示',
      content: '确认下架该商品吗?',
      onOk: () => {
        delGoodsDisable({ ids }).then((res: any) => {
          if (res) {
            message.success('下架成功')
            this.list.refresh()
          }
        })
      }
    })
  };

  // 批量上架
  upper = (ids: string[] | number[]) => {
    Modal.confirm({
      title: '上架提示',
      content: '确认上架该商品吗?',
      onOk: () => {
        enableGoods({ ids }).then((res: any) => {
          if (res) {
            message.success('上架成功')
            this.list.refresh()
          }
        })
      }
    })
  };

  // 导出
  export = () => {
    exportFileList({
      ...this.list.payload,
      status: this.state.status
      // pageSize: 6000,
      // page: 1
    })
  };

  /**
   * 选择项发生变化时的回调
   */
  onSelectChange = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys
    })
  };

  // 切换tabPane
  handleChange = (key: string) => {
    this.setState(
      {
        status: +key
      },
      () => {
        this.list.refresh()
      }
    )
  };
  render () {
    const { selectedRowKeys } = this.state
    const hasSelected
      = Array.isArray(selectedRowKeys) && selectedRowKeys.length > 0
    const { status } = this.state
    const tableProps: any = {
      scroll: {
        x: true
      },
      rowSelection: {
        selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
    if ([1, 0].includes(status)) {
      tableProps.footer = () => (
        <>
          <If condition={status === 1}>
            <Button
              type='danger'
              onClick={() => {
                this.upper(selectedRowKeys)
              }}
              disabled={!hasSelected}
            >
              批量上架
            </Button>
          </If>
          <If condition={status === 0}>
            <Button
              type='danger'
              onClick={() => {
                this.lower(selectedRowKeys)
              }}
              disabled={!hasSelected}
            >
              批量下架
            </Button>
          </If>
        </>
      )
    }
    return (
      <Card>
        <Tabs defaultActiveKey='0' onChange={this.handleChange}>
          <TabPane tab='出售中' key='0' />
          <TabPane tab='仓库中' key='1' />
        </Tabs>
      </Card>
    )
  }

  // 置顶事件
  up = (id: string) => {
    upByGoodsId({ productId: id }).then((res) => {
      if (res) {
        message.success('置顶成功')
        this.list.refresh()
      }
    })
  };

  // 取消置顶事件
  cancelUp = (id: string) => {
    cancelUpByGoodsId({ productId: id }).then((res) => {
      if (res) {
        message.success('取消置顶成功')
        this.list.refresh()
      }
    })
  };
}

export default SkuSaleList
