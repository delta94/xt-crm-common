const { get, post, newPost, del } = APP.http

export const getList = (payload: any) => {
  // /msg/group/queryList
  // http://mock-ued.hzxituan.com/mock/5da1a097b62ce300168bb5d7/crm/demo/list#!method=get
  console.log(payload, '---------  getList ')
  return newPost('/msg/group/queryList', payload)
}

export const fetchDetail = (id: any) => {
  return newPost(`/msg/group/selectById/${id}`)
}

export const saveMessage = (payload: Message.ItemProps) => {
  return newPost(`/msg/group/save`, payload)
}

export const deleteMessage = (id: any) => {
  return del(`/msg/group/delete/${id}`)
}

/** 取消任务发送 */
export const cancelTaskSend = (id: any) => {
  return newPost(`/msg/group/updateStatusById`, {
    pushType: 4,
    jobId: id
  })
}