import { newPost } from '@/util/fetch'

/** 获取店铺详情信息 */
export function getShopInfo (data) {
  return newPost('/shop/apply/v1/detail', data)
}

/** 店铺审核列表 */
export function getFreightTemplate (merchantApplyLog) {
  return newPost('/shop/apply/v1/list', { merchantApplyLog })
}

/** 审核店铺 */
export function auditShop (data) {
  return newPost('/shop/apply/v1/audit', data)
}
