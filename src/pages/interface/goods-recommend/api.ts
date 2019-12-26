import { Item } from './index'
const { get, newPost } = APP.http
export const fetchList = (payload: {
  createStartTime: number
  createEndTime: number
  location: number
  name: string
  pageNo: number
  pageSize: number
  status: number
}) => {
  return newPost(`/product/recommend/list`, payload)
}

export const add = (payload: Item) => {
  return newPost('/product/recommend/add', payload)
}

export const fetchGoodsList = (
  payload: {
    pageNo?: number
    page: number | undefined
    pageSize: number
  }
) => {
  payload = {
    ...payload,
    pageNo: payload.pageNo !== undefined ? payload.pageNo : payload.page,
    page: undefined
  }
  return get('/product/recommend/queryProductList', payload)
}

export const fetchDetail = (id: any) => {
  return get(`/product/recommend/detail/${id}`)
}