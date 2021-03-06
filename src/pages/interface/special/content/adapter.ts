/*
 * @Date: 2020-03-16 14:01:18
 * @LastEditors: fangbao
 * @LastEditTime: 2020-05-18 15:37:45
 * @FilePath: /eslint-plugin-xt-react/Users/fangbao/Documents/xituan/xt-crm/src/pages/interface/special/content/adapter.ts
 */
import { status } from './config'
import { removeURLDomain } from '@/util/utils'

/** 保存专题内容请求 */
export function saveSubjectFloorParams (payload: any) {
  if (!Array.isArray(payload.list)) {
    payload.list = []
  }
  const result: any = {}
  result.list = payload.list.map((v: any) => {
    if (v.advertisementImgUrl) {
      v.advertisementImgUrl = removeURLDomain(v.advertisementImgUrl)
    }
    if (v.type === 4) {
      v.content = JSON.stringify(APP.fn.formatUnSafeData(v.content))
    }
    return v
  })
  return {
    ...payload,
    ...result
  }
}

/** 分页查询楼层响应 */
export function queryFloorRespones (res: any) {
  res.records = Array.isArray(res.records) ? res.records.map((v: any) => {
    v.modifyTime = APP.fn.formatDate(v.modifyTime)
    v.statusText = status[v.status]
    return v
  }): []
  return res
}

/** 条件查询楼层信息 */
export function subjectFloorDetailResponse (res: any) {
  res.modifyTimeText = APP.fn.formatDate(res.modifyTime)
  if (!Array.isArray(res.list)) {
    res.list = []
  }
  res.list = res.list.map((v: any) => {
    if (!Array.isArray(v.products)) {
      v.products = []
    }
    if (!Array.isArray(v.coupons)) {
      v.coupons = []
    }
    if (v.type === 4) {
      console.log(v, '4444')
      try {
        v.content = JSON.parse(v.content)
        console.log(v.content, 'xxx')
      } catch (e) {
        console.log(e, 'eee')
        v.content = undefined
      }
    }
    return v
  })
  return res
}