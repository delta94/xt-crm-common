import React from 'react'
import { ListPage, FormItem } from '@/packages/common/components'
import { ColumnProps } from 'antd/es/table'
import { getDefaultConfig, promotionStatusEnum, statusArray } from './config'
import { getPromotionList, publishPromotion, closePromotion } from './api'
import { Button, Select, Modal } from 'antd'
import { ListPageInstanceProps } from '@/packages/common/components/list-page'

interface Props {
  type: string
}
class Main extends React.Component<Props> {
  public listRef: ListPageInstanceProps
  public columns: ColumnProps<any>[] = [{
    title: '活动编号',
    dataIndex: 'promotionId'
  }, {
    title: '活动名称',
    dataIndex: 'title'
  }, {
    title: '报名时间',
    render: (record) => {
      return APP.fn.formatDate(record.applyStartTime,) + '~' + APP.fn.formatDate(record.applyEndTime)
    }
  }, {
    title: '预热时间',
    render: (record) => {
      if (!record.preheatStartTime || !record.preheatEndTime) {
        return '-'
      }
      return APP.fn.formatDate(record.preheatStartTime) + '~' + APP.fn.formatDate(record.preheatEndTime)
    }
  }, {
    title: '活动排期时间',
    render: (record) => {
      return APP.fn.formatDate(record.startTime) + '~' + APP.fn.formatDate(record.endTime)
    }
  }, {
    title: '活动状态',
    dataIndex: 'status',
    render: (text) => {
      return promotionStatusEnum[text]
    }
  }, {
    title: '店铺id',
    dataIndex: 'shopId'
  }, {
    title: '店铺名称',
    dataIndex: 'shopName'
  }, {
    title: '活动报名商品',
    render: (record) => {
      return (
        <>
          <div>全部商品：{record.productCount}个</div>
          <div>sku：{record.skuCount}个</div>
          <div>通过sku：{record.passSkuCount}个</div>
        </>
      )
    }
  }, {
    title: '排序',
    dataIndex: 'sort'
  }, {
    title: '创建人',
    dataIndex: 'operator'
  }, {
    title: '操作',
    render: (record) => {
      return (
        <>
          <span
            className='href'
            onClick={() => {
              APP.history.push(`/shop/activity/edit?promotionId=${record.promotionId}`)
            }}
          >
            编辑
          </span>
          {/* 待发布状态显示发布，已发布进行中状态显示关闭 */}
          {record.status === promotionStatusEnum['待发布'] ? (
            <span
              className='href ml10'
              onClick={this.publish.bind(null, record.venueId)}
            >发布</span>
          ) : (
            <span
              className='href ml10'
              onClick={this.close.bind(null, record.promotionId)}
            >关闭</span>
          )}
          <span className='href ml10'>复制</span>
          <span
            className='href ml10'
            onClick={() => {
              APP.history.push('/shop/activity/detail')
            }}
          >查看详情</span>
          <span className='href ml10'>排序</span>
        </>
      )
    }
  }]
  // 发布
  public publish = async (venueId: number) => {
    Modal.confirm({
      title: '系统提示',
      content: '是否确认发布？',
      onOk: async () =>{
        const res = await publishPromotion(venueId)
        if (res) {
          APP.success('发布活动成功')
          this.listRef.refresh()
        }
      }
    })
  }
  // 关闭
  public close = async (promotionId: number) => {
    Modal.confirm({
      title: '系统提示',
      content: '是否确认关闭？',
      onOk: async () => {
        const res = await closePromotion(promotionId)
        if (res) {
          APP.success('关闭活动成功')
          this.listRef.refresh()
        }
      }
    })
  }
  public render() {
    const type = this.props.type || ''
    let filters = type.split(',').map(x => +x)
    if (filters.includes(0)) {
      filters = filters.concat([1, 2, 3, 4, 5, 6, 7])
    }
    const statusOption = statusArray.filter(option => filters.includes(option.value))
    return (
      <ListPage
        getInstance={(ref) => {
          this.listRef = ref
        }}
        formConfig={getDefaultConfig()}
        rangeMap={{
          activityTime: {
            fields: ['startTime', 'endTime']
          }
        }}
        formItemLayout={(
          <>
            <FormItem name='title' />
            <FormItem
              label='活动状态'
              inner={(form) => {
                return form.getFieldDecorator('status')(
                  <Select style={{ width: 172 }} placeholder='请选择活动状态' allowClear>
                    {statusOption.map((item) => (
                      <Select.Option value={item.value}>{item.label}</Select.Option>
                    ))}
                  </Select>
                )
              }}
            />
            <FormItem name='activityTime' />
            <FormItem name='promotionId' />
            <FormItem name='operator' />
          </>
        )}
        addonAfterSearch={(
          <Button
            type='primary'
            onClick={() => {
              APP.history.push('/shop/activity/add')
            }}
          >
            新建活动
          </Button>
        )}
        processPayload={(payload) => {
          if (payload.status === undefined) {
            payload.status = type
          }
          return payload
        }}
        columns={this.columns}
        api={getPromotionList}
      />
    )
  }
}

export default Main