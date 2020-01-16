import _ from 'lodash'
import { OptionProps } from '@/packages/common/components/form'
export interface FieldsConfig {
  [namespace: string]: {[field: string]: OptionProps}
}
export function getFieldsConfig (partial?: FieldsConfig): FieldsConfig {
  const defaultConfig: FieldsConfig = {
    common: {
      phone: {
        type: 'input',
        fieldDecoratorOptions: {
          rules: [
            {
              pattern: /^\d{11}$/,
              message: '格式不正确'
            }
          ]
        }
      },
      memberId: {
        type: 'input',
        fieldDecoratorOptions: {
          rules: [
            {
              pattern: /^\d+$/,
              message: '格式不正确'
            }
          ]
        }
      },
      anchorId: {
        type: 'number', label: '主播ID',
        controlProps: {
          style: {
            width: 150
          },
          placeholder: '主播ID'
        }
      },
      nickName: {
        type: 'input', label: '主播昵称',
        controlProps: {
          placeholder: '主播昵称'
        }
      },
      status: {
        type: 'select', label: '状态',
        fieldDecoratorOptions: {
          initialValue: 0
        },
        options: [
          {label: '黑名单主播', value: 1},
          {label: '正常', value: 0}
        ]
      },
      anchorIdentityType: {
        type: 'select', label: '主播身份',
        options: [
          {label: '供应商', value: 20},
          {label: '公司', value: 10},
          {label: '合作网红', value: 30},
          {label: '代理', value: 40}
        ],
        fieldDecoratorOptions: {
          rules: [
            {
              required: true,
              message: '请选择主播身份'
            }
          ]
        }
      },
      anchorLevel: {
        type: 'select', label: '主播等级',
        options: [
          {label: '星级主播', value: 10},
          {label: '普通主播', value: 0}
        ],
        fieldDecoratorOptions: {
          rules: [
            {
              required: true,
              message: '请选择主播等级'
            }
          ]
        }
      }
    }
  }
  return _.mergeWith(defaultConfig, partial)
}

export enum AnchorIdentityTypeEnum {
  供应商 = 20,
  公司 = 10,
  合作网红 = 30,
  代理 = 40
}

export enum AnchorLevelEnum {
  星级主播 = 10,
  普通主播 = 0
}