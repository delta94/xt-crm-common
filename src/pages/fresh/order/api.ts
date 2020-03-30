import { post, exportFile, exportFileStream, get, put, newPut, newPost, fetch } from '@/util/fetch';
import { prefix } from '@/util/utils';
import { batchExportRequest } from './adapter'
const debug = false;
var qs = require('qs');
export interface batchExportPayload {
  expressCompanyCode: string;
  expressNumbers: string;
  fileName: string;
}

// 获取订单类型集合
export function getOrderTypeList () {
  return get('/order/getOrderTypeList?bizType=10')
}

// 批量轨迹导出
export function batchExport(payload: batchExportPayload) {
  return exportFileStream('/expressTracking/batchExport', batchExportRequest(payload), payload.fileName)
}

// 订单售后校验团长等级是否会降级
export function verifyDownDgrade(data: any) {
  return newPost('/order/afterSale/check/downHeadgrade', data);
}

// 订单列表
export function getOrderList(data: any) {
  // return post('/order/list', data);
  return post('/order/freshList', { ...data, bizType: 10 })
}

// 客服代申请售后单个商品详情
export function getProductDetail({ mainOrderId, skuId }: any) {
  return get(`/order/afterSale/applyOrderSKuDetail/${mainOrderId}/${skuId}`)
}
// 获取售后原因
export function customerUpdate(data: any) {
  return newPut('/order/afterSale/customerUpdate', data);
}
// 获取售后原因
export function getRefundReason() {
  return get('/order/afterSale/getRefundReason');
}
// 重新退款
export function againRefund(id: number, info: any) {
  return post(`/order/afterSale/againRefund/${id}`, { info });
}

/**
 * 取消售后
 * @param skuServerId 
 */
export function cancelRefund(skuServerId: number, info: string) {
  return post(`/order/afterSale/cancelRefund/${skuServerId}`, {info})
}

/**
 * 更新物流信息接口
 */
export function updateOrderExpress(data: any) {
  return post('/order/afterSale/updateOrderExpress', data)
}
/**
 * 完成订单
 * @param id 
 * @param info 
 */
export function closeOrder(id: number, info: any) {
  return post(`/order/afterSale/close/${id}`, { info });
}
/**
 * 确认收货
 * @param skuServerId 
 */
export function confirmReceipt(skuServerId: number) {
  return newPost(`/order/afterSale/confirm/${skuServerId}`)
}
/**
 * 售后轨迹详情
 * @param skuServerId 
 */
export function getSkuServerProcessDetailList(skuServerId: number) {
  return get(`/order/afterSale/getSkuServerProcessDetailList/${skuServerId}`)
}
export function saveRefundInfo(data: any) {
  return post('/order/afterSale/saveRefundInfo', data)
}

// 订单详情
export function queryOrderDetail(data: any) {
  return post('/order/freshDetail', data);
  // return post('/order/freshDetail', data);
}

export function push1688(childOrderId: number) {
  return get('/order/push1688', { childOrderId: childOrderId })
}

export function withhold(childOrderId: number) {
  return get('/order/protocolPay', { childOrderId: childOrderId })
}

export function setOrderRemark(data: any) {
  if (debug) {
    return Promise.resolve(true);
  }
  return post('/order/saveInfo', data);
}

export function setRefundOrderRemark(data: any) {
  if (debug) {
    return Promise.resolve(true);
  }
  return post('/order/afterSale/saveRefundInfo', data);
}

export function deliveryOrder(data: any) {
  console.log('deliveryOrder', data);
  if (debug) {
    return Promise.resolve(true);
  }
  return post('/order/delivery', data);
}

export function deliveryChildOrder(data: any) {
  console.log('deliveryChildOrder', data);
  if (debug) {
    return Promise.resolve(true);
  }
  return post(`/order/${data.orderId}/delivery`, data);
}

export function updateLogisticsInfo(data: any) {
  return post('/order/updateOrderExpress', data);
}

export function addLogisticsInfo(data: any) {
  return post('/order/addOrderExpress', data);
}

export function getRefundOrderDetail(data: any) {
  return post('/order/afterSalesInfo', data);
}

export function refundOperate(data: any) {
  return newPost('/order/afterSale/auditOperate', data);
}

export function getStoreList(data: any) {
  return fetch('/store/list', {
    method: 'POST',
    data,
    /** 禁止日志 */
    banLog: true
  })
}
export function customerAdd(data: any) {
  return fetch('/order/afterSale/customerAdd', {
    method: 'POST',
    data
  })
}
export function customerAddCheck(data: any) {
  return fetch('/order/afterSale/check/downgrade', {
    method: 'POST',
    data
  });
}

export function refundList(data: any) {
  return fetch('/order/afterSale/list', {
    method: 'POST',
    data
  });
}

export function refundDetail(params: any) {
  return fetch(`/order/afterSale/afterSalesInfo?${qs.stringify(params)}`)
}
export function exportOrder(data: any) {
  return exportFile('/order/freshExport', data);
}

export const importLogistics = prefix('/order/logistics/import');

export function getRefundOrderInfo(params: any) {
  return fetch(`/order/afterSalesInfo?${qs.stringify(params)}`);
}

export function refundAgain(data: any) {
  return post(`/order/afterSale/againRefund/${data.id}`);
}

export function closeRefund(data: any) {
  return post(`/order/afterSale/close/${data.id}`);
}

export function exportRefund(data: any) {
  return exportFile('/order/afterSale/export', data);
}

export function profitRecal(data: any) {
  return fetch('/order/profit/recal', {
    method: 'POST',
    data
  });
}
export function profitRecycl(data: any) {
  return fetch('/order/profit/recycling', {
    method: 'POST',
    data
  });
}

/**
 * 根据订单号获取用户收益列表
 * @param {object} data  
 */
export function getProceedsListByOrderId(param: any) {
  return get(`/crm/member/common/settlement/v1/summary`, param);
}

/**
 * 根据订单Id和会员Id获取用户收益列表
 * @param {object} data  
 */
export function getProceedsListByOrderIdAndMemberId(param: any) {
  return get(`/crm/member/settlement/v1/order/skuSummaryByMember`, param);
}

/**
 * 根据订单Id和会员Id和SkuId获取用户收益列表
 * @param {object} data  
 */
export function getProceedsListByOrderIdAndMemberIdAndSkuId(param: any) {
  return get(`/crm/member/settlement/v1/detail`, param);
}

/**
 * 根据订单Id和skuId获取用户收益列表
 * @param {object} data  
 */
export function getProceedsListByOrderIdAndSkuId(param: any) {
  return get(`/crm/member/common/settlement/v1/skuSummary`, param);
}

/**
 * 取消订单拦截
 * @param {object}  param
 */
export function cancelIntercept(param: any) {
  return post('/order/intercept/cancelIntercept', param);
}

/**
 * 对拦截订单发货
 * @param {object}  param
 */
export function deliveryInterceptOrder(param: any) {
  return post('/order/intercept/interceptDeliver', param);
}

/**
 * 下单一小内修改收货地址
 * @param {object}  param
 */
export function modifyAddress(data: any) {
  return fetch('/order/updateContact', {
    method: 'POST',
    data,
    hideLoading: true
  });
}

