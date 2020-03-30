import { formRequest, baseProductResponse, baseProductPageResponse, formResponse, baseSkuDetailResponse } from './adapter'
import { queryString } from '@/util/utils'
import { omit } from 'lodash'
const { newPost, newPut } = APP.http

// 库存商品ID查询
export function getBaseProduct(id: number) {
  return newPost(`/product/basic/${id}`).then(baseProductResponse)
}

// 库存商品编码查询
export function getBaseBarcode(barCode: string) {
  return newPost(`/product/basic/bar_code?barCode=${barCode}`)
}

// 库存商品选择分页查询
export function getBaseProductPage(payload: {
  productBasicId?: string,
  productName?: string,
  //  0-失效,1-正常,2-异常，3-售罄
  status?: 0 | 1 | 2 | 3,
  categoryId?: string,
  page: number,
  pageSize: number
}) {
  const search = queryString(payload);
  return newPost(`/product/basic/select/page${search}`).then(baseProductPageResponse);
}

// 获取组合商品详情
export function getGroupProductDetail(payload: { productId: number }) {
  return newPost(`/product/group/detail?productId=${payload.productId}`).then(formResponse)
}

// 新增组合商品
export function setGroupProduct(payload: any) {
  const isAdd = payload.productId === -1
  payload = formRequest(payload)
  return isAdd ? newPost('/product/fresh/add', omit(payload, 'productId')) : newPut('/product/fresh/update', payload)
}

// 销售商品SKU中库存商品详情
export function getBaseSkuDetail(skuId: number) {
  return newPost(`/product/sku/basic/detail?skuId=${skuId}`).then(baseSkuDetailResponse)
}