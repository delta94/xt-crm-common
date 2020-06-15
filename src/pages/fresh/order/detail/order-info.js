import React, { useState } from 'react';
import { Card, Row, Col, Modal, Table, Button } from 'antd';
import { OrderStatusTextMap } from '../constant';
import { levelName } from '@/pages/user/utils';
import { If } from '@/packages/common/components';
import { unionAddress } from '@/pages/helper';
const initOrderInfo = {
  childOrderList: [
    {
      createTime: 0,
      orderCode: 'string',
      paymentNumber: 'string',
      storeName: 'string',
    },
  ],
  createTime: 0,
  orderCode: 'string',
  orderStatus: 0,
  paymentNumber: 'string',
  remark: 'string',
};

const OrderInfo = ({ orderInfo = initOrderInfo, buyerInfo = {}, changeModifyAddress }) => {
  const [visible, setVisible] = useState(false);
  const { orderStatus, orderCode, orderBizTypeStr, remark, orderTypeStr, finishTime, createTime, orderMemberType, orderMemberTypeLevel, closeReason, groupCode, groupBuyOrderCodes, payDate } = orderInfo;
  const { phone, contact, memberAddress = {}, userName, nickname } = buyerInfo;
  // 支付时间小于1个小时显示按钮。
  const isModify = (new Date().getTime() - payDate) < 3600000;
  return (
    <>
      <Modal
        title='关联订单'
        onCancel={() => setVisible(false)}
        visible={visible}
        footer={null}
      >
        <Table
          columns={[{
            title: '拼团编号',
            dataIndex: 'groupCode'
          }, {
            title: '订单编号',
            dataIndex: 'orderCode',
            render: (code) => {
              return (
                <span
                  // type='link'
                  // href={window.location.pathname + `#/fresh/order/detail/${code}`}
                  // target="_blank"
                  className='href'
                  onClick={() => {
                    APP.open(`/fresh/order/detail/${code}`)
                  }}
                >
                  {code}
                </span>
              )
            }
          }, {
            title: '状态',
            dataIndex: 'groupOrderStatus'
          }]}
          dataSource={groupBuyOrderCodes}
        />
      </Modal>
      <Card title="订单信息">
        <Row gutter={24}>
          <Col span={8}>订单编号：{orderCode}</Col>
          <Col span={8}>创建时间：{APP.fn.formatDate(createTime)}</Col>
          <Col span={8}>订单状态：{OrderStatusTextMap[orderStatus]}</Col>
          {orderStatus === 60 && <Col span={8}>关闭原因：{closeReason}</Col>}
          <Col span={8}>买家名称：{userName}</Col>
          <Col span={8}>微信昵称：{nickname}</Col>
          <Col span={8}>联系电话：{phone}</Col>
          <Col span={8}>订单来源：{orderBizTypeStr}</Col>
          <Col span={8}>订单类型：{orderTypeStr}</Col>
          <Col span={8}>完成时间：{APP.fn.formatDate(finishTime)}</Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>下单会员类型：{levelName({memberType: orderMemberType, memberTypeLevel: orderMemberTypeLevel})}</Col>
          <Col span={16}>收货信息：{contact}，{memberAddress &&　memberAddress.phone}</Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>买家备注：{remark}</Col>
          <If condition={!!groupCode}>
            <Col span={16}>
              拼团编号：{
                groupCode === orderCode ? groupCode : (
                  <span
                    className='href'
                    onClick={() => setVisible(true)}
                  >
                    {groupCode}
                  </span>
                )
              }
            </Col>
          </If>
        </Row>
      </Card>
    </>
  );
};

export default OrderInfo;
