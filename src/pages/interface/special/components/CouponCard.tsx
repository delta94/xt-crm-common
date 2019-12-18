import React from 'react'
import { Row, Col, Radio } from 'antd'
import CouponModal from '@/components/coupon-modal'
import Coupon from './content/coupon'
import Card from './Card'

interface Props {
  extra?: boolean
  detail: any,
  onChange: (payload: any) => void
}
interface State {
  couponVisible: boolean,
  selectedRowKeys: any[]
}
class Main extends React.Component<Props, State> {
  public state: State = {
    couponVisible: false,
    selectedRowKeys: []
  }
  public tempCrmCoupons: Coupon.CouponItemProps[] = []
  public render () {
    const { detail, extra } = this.props
    const { couponVisible, selectedRowKeys } = this.state
    return (
      <Card title='商品' sort={0} extra={extra}>
        <Row gutter={12}>
          <Col span={3}>样式:</Col>
          <Col span={9}>
            <Radio.Group
              value={detail.css}
              onChange={(e) => {
                this.props.onChange({
                  ...detail,
                  css: e.target.value
                })
              }}
            >
              <Radio value={1}>1*1</Radio>
              <Radio value={2}>1*2</Radio>
            </Radio.Group>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={21} offset={3}>
            {detail.subjectCoupons && (
              <Coupon
                dataSource={detail.subjectCoupons}
                onChange={value => {
                  detail.subjectCoupons = value
                  this.props.onChange(detail)
                }}
              />
            )}
            <CouponModal
              visible={this.state.couponVisible}
              selectedRowKeys={selectedRowKeys}
              onCancel={() => {
                this.setState({ couponVisible: false })
              }}
              onSelectAll={(selected, selectedRows, changeRows) => {
                console.log('onSelectAll=>', selected, selectedRows, changeRows)
                if (selected) {
                  changeRows.map(item => {
                    this.tempCrmCoupons.push(item)
                  })
                } else {
                  const ids = changeRows.map(val => val.id)
                  this.tempCrmCoupons = this.tempCrmCoupons.filter(item => {
                    return ids.indexOf(item.id) === -1
                  })
                }
              }}
              onSelect={(record, selected) => {
                if (!record) {
                  return
                }
                if (selected) {
                  if (record) {
                    this.tempCrmCoupons.push(record)
                  }
                } else {
                  this.tempCrmCoupons = this.tempCrmCoupons.filter(
                    item => item && item.id !== record.id,
                  )
                }
              }}
              onOk={() => {
                this.tempCrmCoupons = this.tempCrmCoupons.filter(item => !!item)
                detail.subjectCoupons = this.tempCrmCoupons
                this.props.onChange(detail)
                this.setState({ couponVisible: false })
              }}
            />
            <span
              className="href"
              onClick={() => {
                this.setState({ couponVisible: true })
              }}
            >
              添加优惠券
            </span>
          </Col>
        </Row>
      </Card>
    )
  }
}

export default Main