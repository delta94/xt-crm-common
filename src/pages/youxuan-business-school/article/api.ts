import { newPost } from "@/util/fetch";
import { queryString } from "@/util/utils";
import { adapterArticleParams, adapterArticleResponse } from './adapter'

/** 查询文章列表 */
export function getArticleList (payload: {
  title?: string,
  columnId?: number,
  id?: number,
  status?: number,
  page: number,
  pageSize: number
}) {
  // 平台渠道: 1优选/2好店
  return newPost('/mcweb/octupus/discover/article/list', { ...payload, platform: 1 })
}

interface Payload {
  id?: number
  title?: string
  coverImage?: string
  columnId?: number
  columnName?: string
  isDelete?: 1 | 0
  releaseStatus?: 10 | 20 | 30 | 40 | 50
  topStatus?: 1 | 2
  context?: string
  contextType?: 1 | 2
  releaseTime?: number
  memberLimit?: 1 | 2 | 3 | 4
  virtualRead?: number
  productIds?: number[]
  resourceUrl?: string
  fileSize?: number
  resourceType?: number
  createUid?: number
}

/**
 * 发布文章
 * @param payload
 */
export function saveDiscoverArticle (payload: Payload) {
  return newPost('/mcweb/octupus/discover/article/save', adapterArticleParams(payload))
}

/**
 * 更新文章内容
 */
export function modifyDiscoverArticle (payload: Payload) {
  return newPost('/mcweb/octupus/discover/article/modify', adapterArticleParams(payload))
}

/**
 * 文章删除
 */
export function deleteArticle (payload: {
  id: number
}) {
  return newPost('/mcweb/octupus/discover/article/modify/delete', payload)
}

/**
 * 文章置顶操作
 * id: 文章ID
 * topStatus: 1、未置顶/2、已置顶
 * @param payload
 */
export function modifyTopStatus (payload: {
  id: number,
  topStatus: 1 | 2
}) {
  return newPost('/mcweb/octupus/discover/article/modify/topStatus', payload)
}

/**
 * 文章上下架操作
 * id: 文章ID
 * status: 1、下架 2、下架
 */
export function modifyArticleStatus (payload: {
  id: number,
  status: 1 | 2
}) {
  return newPost('/mcweb/octupus/discover/article/modify/status', payload)
}

/**
 * 查询单个文章
 */
export function getDiscoverArticle (id: string) {
  return newPost(`/mcweb/octupus/discover/article/detail?id=${id}`).then(adapterArticleResponse)
}

/**
 * 查询所有栏目
 * 平台渠道: 1优选/2好店
 */
export function getAllColumn () {
  return newPost('/mcweb/octupus/discover/column/all?platform=1').then((res: any) => {
    return res.map((item: any) => ({ label: item.columnName, value: item.id }))
  })
}

/**
 * 获取商品列表
 * productId: 商品ID
 * productName: 商品名称
 * 渠道 1-优选,2-好店
 */
export function getProductList (payload: {
  productId: string
  productName: string
  channel: 1 | 2
}) {
  const search = queryString(payload)
  return newPost(`/mcweb/product/list${search}`)
}

