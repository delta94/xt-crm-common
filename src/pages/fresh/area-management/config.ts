import { FieldsConfig } from '@/packages/common/components/form'

export const NAME_SPACE = 'area_management'
export const defaultConfig: FieldsConfig = {
  area_management: {
    phone: {
      label: '手机号',
      fieldDecoratorOptions: {
        rules: [{
          required: true,
          message: '请输入名称'
        }]
      }
    }
  }
}

export const defaultConfigForm: FieldsConfig = {
  area_management: {
    code: {
      label: '序号'
    },
    name: {
      label: '名称',
      fieldDecoratorOptions: {
        rules: [{
          required: true,
          message: '请输入名称'
        }]
      }
    },
    remark: {
      type: 'textarea',
      controlProps: {
        rows: 5
      },
      label: '说明',
      fieldDecoratorOptions: {
        rules: [{
          required: true,
          message: '请输入名称'
        }]
      }
    },
    rule: {
      type: 'textarea',
      controlProps: {
        rows: 5
      },
      label: '团长招募规则',
      fieldDecoratorOptions: {
        rules: [{
          required: true,
          message: '请输入名称'
        }]
      }
    },
    inviteShopName: {
      label: '普通团长招募上限',
      fieldDecoratorOptions: {
        rules: [{
          required: true,
          message: '请输入名称'
        }]
      }
    },
    inviteShopPhone: {
      label: '精英团长招募上限',
      fieldDecoratorOptions: {
        rules: [{
          required: true,
          message: '请输入名称'
        }]
      }
    },
    inviteShopPhone1: {
      label: '试题链接'
    },
    inviteShopPhone2: {
      label: '指导员招募上限',
      fieldDecoratorOptions: {
        rules: [{
          required: true,
          message: '请输入名称'
        }]
      }
    },
    qrCode: {
      label: '群二维码',
      fieldDecoratorOptions: {
        rules: [{
          required: true,
          message: '请输入名称'
        }]
      }
    }
  }
}
export enum statusEnums {
  失效 = 0,
  正常 = 1,
  // 异常 = 2,
  // 售罄 = 3
}