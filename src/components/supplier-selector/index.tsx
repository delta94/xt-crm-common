import React from 'react'
import { Select, Spin } from 'antd'
import debounce from 'lodash/debounce'
import { getAllStoreList, getYxStoreList } from './api'

const { Option } = Select
export interface SupplierItem {
  id: number;
  name: string;
}

type ValueProps = { label: string, key: any }

interface SupplierSelectProps {
  processPayload?: (data?: any) => any
  style?: React.CSSProperties
  disabled?: boolean
  onChange?: (value: ValueProps, options: SupplierItem[]) => void
  value?: ValueProps
  options?: SupplierItem[]
  /** 5-生鲜 6-小店 */
  category?: 5 | 6
  type?: 'all' | 'yx'
}
interface SupplierSelectState {
  supplierList: SupplierItem[],
  fetching: boolean
}
class SupplierSelect extends React.Component<SupplierSelectProps, SupplierSelectState> {
  lastFetchId: number = 0;
  constructor (props: SupplierSelectProps) {
    super(props)
    this.state = {
      supplierList: [],
      fetching: false
    }
    this.fetchSupplier = debounce(this.fetchSupplier, 800)
  }
  UNSAFE_componentWillReceiveProps (nextProps: SupplierSelectProps) {
    if (nextProps.options && this.props.options !== nextProps.options) {
      this.setState({
        supplierList: nextProps.options
      })
    }
  }
  fetchSupplier = (name: string) => {
    const category = this.props.category
    const processPayload = this.props.processPayload
    const type = this.props.type || 'all'
    if (name) {
      this.lastFetchId += 1
      const fetchId = this.lastFetchId
      this.setState({ supplierList: [], fetching: true })
      let p
      let param: any
      if (type === 'yx') {
        param = {
          name,
          pageSize: 200
        }
        p = getYxStoreList
      } else {
        param = {
          name,
          category,
          pageSize: 200
        }
        p = getAllStoreList
      }
      if (typeof processPayload === 'function') {
        param = processPayload(param)
      }
      p(param, { hideLoading: true }).then((res: any) => {
        if (fetchId !== this.lastFetchId) {
          return
        }
        this.setState({ supplierList: res.records, fetching: false })
      })
    } else {
      this.setState({
        supplierList: [],
        fetching: false
      })
    }
  }
  handleChange = (value: ValueProps) => {
    const { onChange } = this.props;
    (typeof onChange === 'function') && onChange(value, this.state.supplierList)
  }
  render () {
    const { disabled, value, style } = this.props
    const { fetching, supplierList } = this.state
    return (
      <Select
        style={style}
        disabled={disabled}
        showSearch
        onSearch={this.fetchSupplier}
        defaultActiveFirstOption={false}
        labelInValue
        showArrow={false}
        filterOption={false}
        allowClear
        notFoundContent={fetching ? <Spin size='small' /> : null}
        placeholder='请输入供应商名称'
        onChange={this.handleChange}
        value={value}
      >
        {supplierList.map((item: SupplierItem) => (
          <Option
            value={item.id}
            key={item.id}
            title={item.name}
          >
            {item.name}
          </Option>
        ))}
      </Select>
    )
  }
}

export default SupplierSelect