import React from 'react';
import { Card, Popover, Input, Button, message } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { FormComponentProps } from 'antd/lib/form'
import CardTitle from '../CardTitle';
import SkuUploadItem from './SkuUploadItem';
import styles from './style.module.scss';
import { size, map } from 'lodash';
import SkuTable from './SkuTable'

const defaultItem: SkuSaleProps = {
  imageUrl1: '',
  skuCode: '',
  stock: 0,
  areaMemberPrice: undefined,
  cityMemberPrice: undefined,
  costPrice: undefined,
  headPrice: undefined,
  deliveryMode: 2,
  marketPrice: undefined,
  salePrice: undefined,
  managerMemberPrice: undefined,
  expandable: true,
  commissionPercentage: 10
}

/** 子规格字段集合 */
const subSpecFields: Array<keyof SkuSaleProps> = ['propertyValue1', 'propertyValue2']

export interface SkuSaleProps {
  /** 供应商id */
  storeProductSkuId?: number
  /** 商品编码 */
  skuCode: string
  /** 发货方式 1-仓库发货, 2-供货商发货, 3-其他, 4-保宏保税仓 */
  deliveryMode: 1 | 2 | 3 | 4
  /** 成本价 */
  costPrice?: number
  /** 市场价 */
  marketPrice?: number
  /** 销售价 */
  salePrice?: number
  /** 团长价 */
  headPrice?: number
  /** 社区管理员价 */
  areaMemberPrice?: number
  /** 城市合伙人价 */
  cityMemberPrice?: number
  /** 公司管理员价 */
  managerMemberPrice?: number
  /** 库存 */
  stock: number
  /** 警戒库存 */
  stockAlert?: number
  propertyValue1?: any
  propertyValue2?: any
  imageUrl1?: string
  /** 自提佣金比 */
  commissionPercentage?: number
  [field: string]: any
}

interface Props extends FormComponentProps {
  specs: Spec[]
  dataSource: SkuSaleProps[]
  showImage: boolean
  onChange?: (value: SkuSaleProps[], specs: Spec[], showImage: boolean) => void
  strategyData?: {}
}
interface SpecItem {
  specName: string
  specPicture?: string
}
interface Spec {
  title: string
  content: SpecItem[]
}
/**
 * speSelect 规格项
 */
interface State {
  specs: Spec[]
  specPictures: string[]
  speSelect: any[]
  spuName: any[]
  noSyncList: any[]
  GGName: string
  showImage: boolean
  tempSpecInfo: {[key: number]: SpecItem}
  tempSpuName: string
  tempSpuPicture: any[]
  /** 添加规格名propover显示状态 */
  dimensionNamePropoverStatus: boolean
  dataSource: SkuSaleProps[]
  strategyData: any
}
class SkuList extends React.Component<Props, State>{
  state: State = {
    specs: this.props.specs,
    specPictures: [],
    speSelect: [],
    spuName: [],
    noSyncList: [],
    GGName: '',
    showImage: false,
    tempSpecInfo: {},
    tempSpuName: '',
    tempSpuPicture: [],
    dimensionNamePropoverStatus: false,
    dataSource: this.props.dataSource,
    strategyData: {}
  }
  public static defaultProps = {
    warehouseType: 1
  }
  public componentWillReceiveProps (props: Props) {
    // console.log('dataSource =>', props.dataSource);
    this.setState({
      showImage: props.showImage,
      specs: props.specs,
      dataSource: props.dataSource,
      strategyData: props.strategyData
    })
  }
  public getCombineResult (specs: Spec[], dataSource: SkuSaleProps[]) {
    // console.log(specs, 'specs getCombineResult')
    // console.log(dataSource, 'dataSource getCombineResult')
    const collection = specs.map((item) => item.content)
    const combineResutle: SpecItem[][] = APP.fn.mutilCollectionCombine.apply(null, collection)
    // console.log(combineResutle, 'combineResutle getCombineResult')
    /** 如果合并后只有一组数据切第一项全部都是undefind则数组返回空, */
    if (combineResutle.length === 1 && combineResutle[0].every((item) => item === undefined)) {
      return []
    }
    // let addNew = false
    /** 多规格合并 */
    const result = combineResutle.map((item) => {
      let val: SkuSaleProps = {...defaultItem}
      /** 根据原规格查找规格信息 */
      val = dataSource.find((item2) => {
        /** item 自定义输入规格序列 规格1，2 */
        return item.every((item3, index) => {
          /**
           * item2[subSpecFields[index]] dataSource里的规格名
           * item3 输入的规格名
           * !item2[subSpecFields[index]] 不存在的规格直接过，dataSource必有一个规格名是存在的，对存在的规格进行比对获取已经输入的信息
           */
          return !item3 || !item2[subSpecFields[index]] || item2 && item3 && item3.specName === item2[subSpecFields[index]]
        })
      }) || val
      item.map((item2, index) => {
        const field = subSpecFields[index]
        val[field] = (item2 && item2.specName) as never
        if (index === 0) {
          val.imageUrl1 = item2 && item2.specPicture || val.imageUrl1
        }
        // val.skuId = undefined
      })
      return val
    })
    return result
  }
  handleChangeValue = (text: string, record: any, index: any) => (e: any) => {
    const { dataSource, noSyncList } = this.state;
    const nosync = noSyncList.includes(text);
    /**
     * 每个输入框改变
     */
    if (!nosync) {
      dataSource[index][text] = e.target ? e.target.value : e;
    }
    /**
     * 同步修改一列的数值
     */
    else {
      dataSource.forEach((item, inex) => {
        item[text] = e.target ? e.target.value : e
      })
    }
    this.setState({ dataSource });
  };
  /**
   * 添加规格不能超过两个
   */
  handleAdd = (title: string) => {
    if (size(this.state.specs) >= 0 && size(this.state.specs) < 2) {
      this.state.specs.push({
        title,
        content: []
      });
      this.setState({
        specs: this.state.specs,
        GGName: '',
      });
    }
  };
  /**
   * 添加子规格
   */
  addSubSpec = (key: number) => () => {
    const specs = this.state.specs
    const { content } = specs[key]
    const { tempSpecInfo, showImage } = this.state
    const specName = (tempSpecInfo[key] && tempSpecInfo[key].specName || '').trim()
    const specPicture = tempSpecInfo[0] && tempSpecInfo[0].specPicture
    if (!specName) {
      message.error('请设置规格名称');
      return
    }
    if (content.find((v) => v.specName === specName)) {
      message.error('请不要填写相同的规格');
      return
    }

    specs[key].content.push(this.state.tempSpecInfo[key])
    tempSpecInfo[key] = {
      specName: '',
      specPicture: ''
    }

    //////////////////////////////
    const dataSource1 = this.getCombineResult(specs, this.state.dataSource)
    this.setState({
      dataSource: dataSource1,
      tempSpecInfo,
      specs
    })
    this.onChange(dataSource1)
  }
  handleTabsAdd = () => {
    const GGName = this.state.GGName
    if (!GGName) {
      message.error('请输入正确的规格名称')
      return false
    }
    if (GGName.length > 5) {
      message.error('规格名称不能大于5个字符')
      return
    }
    if (this.state.specs.find((item) => item.title === GGName)) {
      message.error('规格名称重复')
      return false
    }
    this.setState({
      dimensionNamePropoverStatus: false
    })
    this.handleAdd(GGName)
  }
  /**
   * 删除规格
   */
  removeSpec = (index: number) => {
    const { specs } = this.state
    specs.splice(index, 1)
    this.setState({
      specs,
      dataSource: []
    }, () => {
      this.onChange([])
    })
  }
  /** 删除子规格 */
  removeSubSpec = (key: number, index: number) => () => {
    /** 另一组索引 */
    const otherKey = key === 0 ? 1 : 0
    const keys = ['propertyValue1', 'propertyValue2']
    const { specs } = this.state;
    const specName = specs[key].content[index].specName
    specs[key].content.splice(index, 1)
    let dataSource = this.state.dataSource

    /////////////////////
    dataSource = this.getCombineResult(specs, dataSource)
    this.setState({ specs, dataSource })
    this.onChange(dataSource)
    return
    /////////////////////
  }
  public getCustomColumns () {
    const columns: ColumnProps<any>[] = []
    const keys = ['propertyValue1', 'propertyValue2']
    this.state.specs.map((item, index) => {
      if (keys[index]) {
        columns.push({
          width: 100,
          title: item.title,
          dataIndex: keys[index]
        })
      }
    })
    return columns
  }
  public onChange (dataSource: SkuSaleProps[]) {
    if (this.props.onChange) {
      this.props.onChange(dataSource, this.state.specs, this.state.showImage)
    }
  }
  /** 替换图片 */
  public replaceImage (value: SpecItem) {
    const { dataSource, specs } = this.state
    dataSource.map((item) => {
      if (item.propertyValue1 === value.specName) {
        item.imageUrl1 = value.specPicture
      }
    })
    specs[0].content.map((item) => {
      if (item.specName === value.specName) {
        item.specPicture = value.specPicture
      }
    })
    this.setState({
      dataSource,
      specs
    }, () => {
      this.onChange(dataSource)
    })
  }
  render() {
    return (
      <Card
        title='添加规格项'
        style={{ marginTop: 10 }}
        extra={(
          <Popover
            trigger='click'
            visible={this.state.dimensionNamePropoverStatus}
            content={(
            <div style={{ display: 'flex' }}>
                <Input
                  style={{width: 150}}
                  placeholder='请添加规格名称'
                  value={this.state.GGName}
                  onChange={e => {
                    this.setState({
                      GGName: (e.target.value || '').trim()
                    })
                  }}
                />
                <Button type='primary' style={{ marginLeft: 5 }} onClick={this.handleTabsAdd}>
                  确定
                </Button>
              </div>
            )}
          >
            {this.state.specs.length < 2 && (
              <span
                className='href'
                onClick={() => {
                  this.setState({dimensionNamePropoverStatus: true})
                }}
              >
                添加规格
              </span>
            )}
          </Popover>
        )}
      >
        {this.state.specs.map((spec, key) => {
          return (
            <Card
              style={{ marginBottom: 10 }}
              key={key}
              type='inner'
              title={(
                <CardTitle
                  checked={this.state.showImage}
                  title={spec.title}
                  index={key}
                  onChange={(e: any) => {
                    const { dataSource, specs } = this.state
                    const checked = e.target.checked 
                    if (!checked) {
                      dataSource.map((item) => {
                        item.imageUrl1 = ''
                      })
                      specs[0].content.map((item) => {
                        item.specPicture = ''
                      })
                    }
                    this.setState({
                      showImage: checked,
                      dataSource,
                      specs
                    }, () => {
                      this.onChange(dataSource)
                    })
                  }}
                />
              )}
              extra={
                <span className='href' onClick={() => this.removeSpec(key)}>删除</span>
              }
            >
              <div className={styles.spulist}>
                {map(spec.content, (item, index: number) => (
                  <SkuUploadItem
                    value={item}
                    key={`d-${index}`}
                    disabled
                    index={key}
                    showImage={this.state.showImage && key === 0}
                    onChange={(value) => {
                      this.replaceImage(value)
                    }}
                  >
                    <Button
                      className={styles.spubtn}
                      type="danger"
                      onClick={this.removeSubSpec(key, index)}
                    >
                      删除规格
                    </Button>
                  </SkuUploadItem>
                ))}
                {size(spec.content) < 10 && (
                  <SkuUploadItem
                    value={this.state.tempSpecInfo[key]}
                    showImage={this.state.showImage && key === 0}
                    onChange={(value) => {
                      const tempSpecInfo = this.state.tempSpecInfo
                      tempSpecInfo[key] = value
                      this.setState({
                        tempSpecInfo
                      })
                    }}
                  >
                    <Button
                      className={styles.spubtn}
                      type="primary"
                      onClick={this.addSubSpec(key)}>
                      添加规格
                    </Button>
                  </SkuUploadItem>
                )}
              </div>
            </Card>
          )
        })}
        <SkuTable
          form={this.props.form}
          dataSource={this.state.dataSource}
          extraColumns={this.getCustomColumns()}
          onChange={(dataSource) => {
            this.onChange(dataSource)
          }}
        />
      </Card>
    )
  }
}

export default SkuList