import moment from "moment"

/** DatePicker工具方法 */
/** 返回数字范围 */
export function range(start: number, end: number) {
  const result = []
  for (let i = start; i < end; i++) {
      result.push(i)
  }
  return result
}

/** 禁用日期 */
export function disabledDate (current: moment.Moment | null, date: any) {
  return !!current && current < moment(date).endOf('day').subtract(1, 'day');
}

/** 禁用选中时间 */
export function disabledDateTime (current: any, date: any) {
  current = current || moment()
  const y = date.getFullYear()
  const d = date.getDate()
  let h = date.getHours()
  let m = date.getMinutes()
  let s = date.getSeconds()
  console.log(current.year(), current.date(), current.hour(), current.minute(), '-----------')
  /** 选择日期年大于年时或选择日期大于日期时, 时分秒不做限制 */
  if (current.year() > y || current.date() > d) {
    h = 0,
    m = 0,
    s = 0
  }
  /** 当选择时间大于小时数时，选择分钟数不做限制 */
  if (current.date() === d && current.hour() > h) {
    m = 0
  }
  /** 当选择时间等于小时数且选择时间大于分钟数或者选中时间大于小时数，选中秒数不做限制*/
  if (current.hour() === h && current.minute() > m || current.hour() > h) {
    s = 0
  }
  return {
    disabledHours: () => range(0, h),
    disabledMinutes: () => range(0, m),
    disabledSeconds: () => range(0, s)
  }
}