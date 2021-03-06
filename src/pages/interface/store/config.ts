import _ from 'lodash'
import { OptionProps } from '@/packages/common/components/form'
export interface FieldsConfig {
  [namespace: string]: {[field: string]: OptionProps}
}
export function getFieldsConfig (partial?: FieldsConfig): FieldsConfig {
  const defaultConfig: FieldsConfig = {
    common: {
      shopName: {
        label: '门店名称',
        type: 'input',
        controlProps: {
          placeholder: '请输入门店名称'
        }
      },
      createTime: {
        label: '创建时间',
        type: 'rangepicker',
        controlProps: {
          showTime: true
        }
      },
      ranking: {
        label: '权重',
        type: 'number',
        fieldDecoratorOptions: {
          rules: [
            {
              required: true,
              message: '请输入权重'
            }
          ]
        },
        controlProps: {
          style:{width:150},
          precision: 0,
          min: 0,
          max:200,
          placeholder: '请输入权重'
        }
      }
    }
  }
  return _.mergeWith(defaultConfig, partial)
}
