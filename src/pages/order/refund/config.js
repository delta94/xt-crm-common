import React from 'react';
import GoodCell from '@/components/good-cell';
import SuppilerSelect from '@/components/suppiler-auto-select'
import { formatMoneyWithSign } from '@/pages/helper';
import { enumRefundStatus } from '../constant';
import refundType from '@/enum/refundType';
import createType from '@/enum/createType';
import { Button } from 'antd';
import MoneyRender from '@/components/money-render'
import { formatDate } from '@/pages/helper';
import { orderRefunds } from '@/config';
import RemarkModal from '../components/remark-modal'

const OrderRefundStatusEnums = {
  NOT_REFUND: {
    value: 0,
    description: '无售后',
    cDescription: '无售后'
  },
  TO_BE_AUDIT: {
    value: 10,
    description: '待审核',
    cDescription: '待审核'
  },
  TO_BE_C_SEND: {
    value: 20,
    description: '待用户发货',
    cDescription: '处理中'
  },
  REFUND_MONEY_FAILURE: {
    value: 21,
    description: '退款失败',
    cDescription: '处理中'
  },
  REFUND_MONEY_OF: {
    value: 23,
    description: '退款中',
    cDescription: '处理中'
  },
  TO_BE_B_RECEIVE: {
    value: 24,
    description: '待平台收货',
    cDescription: '处理中'
  },
  TO_BE_B_SEND: {
    value: 25,
    description: '待平台发货',
    cDescription: '处理中'
  },
  TO_BE_C_RECEIVE: {
    value: 26,
    description: '待用户收货',
    cDescription: '处理中'
  },
  TO_BE_B_FOLLOW: {
    value: 27,
    description: '等待客服跟进',
    cDescription: '处理中'
  },
  FINISH: {
    value: 30,
    description: '完成',
    cDescription: '售后完成'
  },
  REJECT: {
    value: 40,
    description: '驳回',
    cDescription: '售后关闭'
  }
}

const filterAndMapRefundOrder = cDescription => Object.values(OrderRefundStatusEnums).filter(v => v.cDescription === cDescription).map(v => ({ key: v.value, val: v.description }));
const waitConfirm = filterAndMapRefundOrder('待审核');
const operating = filterAndMapRefundOrder('处理中');
const complete = filterAndMapRefundOrder('售后完成');
const rejected = filterAndMapRefundOrder('售后关闭');
export const orderRefundStatus = {
  [enumRefundStatus.All]: [{key: '', val: '全部'}, ...waitConfirm, ...operating, ...complete, ...rejected],
  [enumRefundStatus.WaitConfirm]: waitConfirm,
  [enumRefundStatus.Operating]: operating,
  [enumRefundStatus.Complete]: complete,
  [enumRefundStatus.Rejected]: rejected
}


export const formFields = function (refundStatus) {
  return [
    {
      type: 'input',
      id: 'mainOrderCode',
      label: '订单编号'
    }, {
      type: 'input',
      id: 'orderCode',
      label: '售后单编号'
    }, {
      type: 'select',
      id: 'refundType',
      label: '售后类型',
      options: refundType.getArray('all')
    }, {
      type: 'input',
      id: 'memberPhone',
      label: '下单人电话'
    }, {
      type: 'input',
      id: 'phone',
      label: '收货人电话'
    }, {
      type: 'input',
      id: 'storeId',
      label: '供应商',
      render: () => <SuppilerSelect />
    }, {
      type: 'input',
      id: 'productId',
      label: '商品ID'
    }, {
      type: 'input',
      id: 'operator',
      label: '处理人'
    }, {
      type: 'select',
      id: 'createType',
      label: '申请人类型',
      options: createType.getArray('all')
    }, {
      type: 'date',
      id: 'apply',
      ids: ['applyStartTime', 'applyEndTime'],
      label: '申请时间'
    }, {
      type: 'date',
      id: 'handle',
      ids: ['handleStartTime', 'handleEndTime'],
      label: '处理时间'
    }, {
      type: 'date',
      id: 'payTime',
      ids: ['payStartTime', 'payEndTime'],
      label: '支付时间'
    }, {
      type: 'input',
      id: 'shipmentNumber',
      label: '物流单号'
    }, {
      type: 'select',
      id: 'orderRefundStatusEnums',
      label: '售后单状态',
      options: orderRefundStatus[refundStatus]
    }
  ];
}

/**
 * 列表属性
 * @param {*} param0 
 */
export const getListColumns = ({ query, history }) => [
  {
    title: '商品ID',
    dataIndex: 'productId'
  },
  {
    title: '商品',
    dataIndex: 'skuName',
    render(skuName, row) {
      return <GoodCell {...row} />;
    },
  },
  {
    title: '单价',
    dataIndex: 'salePrice',
    render(salePrice) {
      return salePrice ? formatMoneyWithSign(salePrice) : '';
    },
  },
  {
    title: '数量',
    dataIndex: 'num',
  },
  {
    title: '供应商',
    dataIndex: 'storeName',
  },
  {
    title: '买家 (手机号)',
    dataIndex: 'userName',
    render(v, record) {
      return `${v ? v : ''} ${record.phone ? `(${record.phone})` : ''}`
    }
  },
  {
    title: '类型',
    dataIndex: 'refundTypeStr',
  },
  {
    title: '售后状态',
    dataIndex: 'refundStatusStr',
  },
  {
    title: '实付金额（元）',
    dataIndex: 'buyPrice',
    render(v) {
      return v ? formatMoneyWithSign(v) : '-'
    }
  },
  {
    title: '退款金额（元）',
    dataIndex: 'refundAmount',
    render(v) {
      return v ? formatMoneyWithSign(v) : '-'
    }
  },
  // {
  //   title: '售后时间',
  //   dataIndex: 'createTime',
  //   render(v) {
  //     return v && moment(v).format(dateFormat)
  //   }
  // },
  {
    title: '处理人',
    dataIndex: 'operator'
  },
  // {
  //   title: '售后单编号',
  //   dataIndex: 'orderCode',
  // },
  // {
  //   title: '订单编号',
  //   dataIndex: 'mainOrderCode',
  // },
  {
    title: '操作',
    dataIndex: 'record',
    render: (_, { id, skuId, refundId, childOrderId, mainOrderCode, orderCode, refundStatus, isDelete }) => {
      return (
        <div style={{ display: 'flex' }}>
          <RemarkModal
            onSuccess={query}
            orderCode={mainOrderCode}
            refundId={refundId}
            childOrderId={childOrderId}
          />
          &nbsp;
          {[enumRefundStatus.Complete, enumRefundStatus.Rejected].includes( // 已完成，已取消（isDelete === 1），已驳回的展示查看
            Number(refundStatus)
          ) || isDelete === 1 ? (
              <Button type="primary" onClick={() => history.push(`/order/refundOrder/${id}`)}>查看</Button>
            ) :
            <Button type="primary" onClick={() => history.push(`/order/refundOrder/${id}`)}>审核</Button>
          }
        </div>
      );
    },
  },
]


export const logisticsInformationColumns = [
  {
    title: '物流公司',
    dataIndex: 'expressName',
    key: 'expressName'
  },
  {
    title: '物流单号',
    dataIndex: 'expressCode',
    key: 'expressCode'
  }
]
export const getDetailColumns = () => [
  {
    title: '名称',
    dataIndex: 'skuName',
    key: 'skuName'
  },
  {
    title: '属性',
    dataIndex: 'properties',
    key: 'properties',
  },
  {
    title: '单价',
    dataIndex: 'salePrice',
    key: 'salePrice',
    render: MoneyRender
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: '商品总价（元）',
    dataIndex: 'saleTotalPrice',
    key: 'saleTotalPrice',
    render: MoneyRender
  },
  {
    title: '优惠券',
    dataIndex: 'faceValue',
    key: 'faceValue'
  },
  {
    title: '应付金额',
    dataIndex: 'dealTotalPrice',
    key: 'dealTotalPrice',
    render: MoneyRender
  },
  {
    title: '优惠金额',
    dataIndex: 'discountPrice',
    key: 'discountPrice',
    render: MoneyRender
  },
  {
    title: '实付金额',
    dataIndex: 'preferentialTotalPrice',
    key: 'preferentialTotalPrice',
    render: MoneyRender
  }
];

export const refundTypes = refundType.getArray()

export const logColumns = [{
  title: '前操作状态',
  dataIndex: 'beforeStatus',
  key: 'beforeStatus',
  render: code => orderRefunds[code]
}, {
  title: '后操作状态',
  dataIndex: 'afterStatus',
  key: 'afterStatus',
  render: code => orderRefunds[code]
}, {
  title: '操作时间',
  dataIndex: 'createTime',
  key: 'createTime',
  render: text => formatDate(text)
}, {
  title: '备注',
  dataIndex: 'info',
  key: 'info'
}, {
  title: '操作人',
  dataIndex: 'operator',
  key: 'operator'
}]