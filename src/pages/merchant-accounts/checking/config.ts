import _ from 'lodash'
import { OptionProps } from '@/packages/common/components/form'
export interface FieldsConfig {
  [namespace: string]: {[field: string]: OptionProps}
}
export function getFieldsConfig (partial?: FieldsConfig): FieldsConfig {
  const defaultConfig: FieldsConfig = {
    common: {
      serialNo: {
        type: 'input', label: '对账单ID',
        controlProps: {
          style: {width: 150}
        }
      },
      storeName: {
        type: 'input', label: '供应商',
        controlProps: {
          placeholder: '请输入供应商名称'
        }
      },
      accStatus: {
        type: 'select', label: '状态',
        options: [
          {label: '待确认', value: 10},
          {label: '可申请结算', value: 20},
          {label: '待结算', value: 30},
          {label: '结算中', value: 40},
          {label: '已结算', value: 50},
          {label: '结算异常', value: 70}
        ]
      },
      sourceNo: {
        type: 'input', label: '交易编号',
        controlProps: {
          placeholder: '请输入交易编号'
        }
      }
    },
    statements: {
      currency: {
        type: 'select', label: '币种',
        fieldDecoratorOptions: {
          initialValue: 10,
          rules: [
            {required: true, message: '请选择币种'}
          ]
        },
        options: [
          {label: '人民币', value: 10}
        ]
      },
      newAccount: {
        type: 'radio', label: '请选择账户',
        options: [
          {label: '新账户', value: 1},
          {label: '已有账户', value: 0}
        ],
        fieldDecoratorOptions: {
          initialValue: 1
        }
      },
      accountType: {
        type: 'radio', label: '账户类型',
        options: [
          // {label: '微信', value: 1},
          // {label: '支付宝', value: 2},
          {label: '个人银行卡', value: 3},
          {label: '对公银行账户', value: 4}
        ],
        fieldDecoratorOptions: {
          initialValue: 2,
          rules: [
            {required: true, message: '请选择账户类型'}
          ]
        }
      },
      bankBranchName: {
        type: 'input', label: '银行支行名称',
        controlProps: {
          placeholder: '请选择收款账号银行名，例如中国银行杭州高新支行',
          maxLength: 50
        },
        fieldDecoratorOptions: {
          rules: [
            {required: true, message: '请输入银行支行名称'},
            {max: 50, message: '长度最大50个字符'}
          ]
        }
      },
      accountName: {
        type: 'input', label: '账户名',
        controlProps: {
          placeholder: '真实姓名或企业名称',
          maxLength: 100
        },
        fieldDecoratorOptions: {
          rules: [
            {required: true, message: '请输入真实姓名或企业名称'},
            {max: 100, message: '长度最大100个字符'}
          ]
        }
      },
      accountCode: {
        type: 'input', label: '账号',
        controlProps: {
          placeholder: '手机号/邮箱',
          maxLength: 32
        },
        fieldDecoratorOptions: {
          rules: [
            {required: true, message: '请输入手机号/邮箱'},
            {max: 32, message: '长度最大32个字符'}
          ]
        }
      },
      bankName: {
        type: 'input', label: '银行名称',
        controlProps: {
          placeholder: '请选择收款账号银行名称',
          maxLength: 32
        },
        fieldDecoratorOptions: {
          rules: [
            {required: true, message: '请输入银行名称'},
            {max: 32, message: '长度最大32个字符'}
          ]
        }
      }
    }
  }
  return _.mergeWith(defaultConfig, partial)
}

/** @对账单状态（10-待确认；20-可申请结算；30-待结算；40-结算中; 50-已结算；60-已结清；70-结算异常；80-已冻结；100-其他） */
export enum AccStatusEnum {
  待确认 = 10,
  可申请结算 = 20,
  待结算 = 30,
  结算中 = 40,
  已结算 = 50,
  // 已结清 = 60,
  结算异常 = 70
  // 已冻结 = 80,
  // 其他 = 100
}

/** 交易状态（1：完成 2：未完成 3：出现异常） */
export enum PaymentStatusEnum {
  完成 = 1,
  未完成 = 2,
  出现异常 = 3
}

/** 交易类型(1:订单收入 2：售后退款 3：运费收入 4：运费支出 5：售后收入) */
export enum PaymentTypeEnum {
  订单收入 = 1,
  售后退款 = 2,
  运费收入 = 3,
  运费支出 = 4,
  售后收入 = 5,
  平台佣金 = 8
}


/** 1-订单收入、3-运费收入交易类型对应的交易状态 */
export enum OrderPaymentStatusEnum {
  未付款 = 10,
  待发货 = 20,
  部分发货 = 25,
  已发货 = 30,
  已收货 = 40,
  完成 = 50,
  关闭 = 60
}

/** 2-售后支出、4-运费支出交易类型对应的交易状态 */
export enum AfterSalePaymentStatusEnum {
  无售后 = 0,
  待审核 = 10,
  待商家审核 = 15,
  待用户发货 = 20,
  退款失败 = 21,
  退款中 = 23,
  待商家收货 = 24,
  待商家发货 = 25,
  待用户收货 = 26,
  等待客服跟进 = 27,
  售后完成 = 30,
  售后关闭 = 40
}