export const namespace = 'activity.full-discount-edit'

export default {
  namespace,
  state: {
    discountModal: { // 优惠信息设置模态框
      visible: false,
      title: '优惠条件'
    },
    goodsModal: { // 商品选择模态框
      visible: false,
      title: '商品查询'
    },
    activityModal: {  // 活动选择模态框
      visible: false,
      title: '活动查询'
    },
    currentRuleIndex: -1 // 当前规则索引
  },
  effects: {}
}