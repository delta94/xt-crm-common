import { get, newPut, newPost } from '@/util/fetch'

/* 获取类目 */
export function getCategoryList (data) {
  return newPost('/category/treeCategory', data)
}

/* 查询列表 */
export function getRefundAutoList (data) {
  return newPost('http://192.168.14.240:8082/order/refund/auto/dispose/queryList', data)
}

/* 添加一个配置 */
export function refundAutoAdd (data) {
  return newPost('http://192.168.14.240:8082/order/refund/auto/dispose/add', data)
}

/* 审核一个配置 */
export function refundAutoAudit (data) {
  return newPut('http://192.168.14.240:8082/order/refund/auto/dispose/audit', data)
}

/* 查看详情 */
export function refundAutoDetail (serialNo) {
  return get('http://192.168.14.240:8082/order/refund/auto/dispose/getDetail', { serialNo })
}

/* 修改配置 */
export function refundAutoUpdate (data) {
  return newPut('http://192.168.14.240:8082/order/refund/auto/dispose/update', data)
}

/* 校验商品 */
export function checkCategory (paload) {
  return newPost('http://192.168.14.240:8082/product/check/category', paload)
}