import React from 'react'
import { Table, Modal, Input } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import _ from 'lodash'
import * as api from '../api'
import Image from '@/components/Image'

const shopTypeMap = {
  1: '喜团自营',
  2: '直播小店',
  3: '品牌旗舰店',
  4: '品牌专营店',
  5: '喜团工厂店',
  6: '普通企业店',
  7: 'pop店'
}

export interface Item {
  id?: number
  productId?: number
  productName: string
  productRecommendId: number
  stock: number
  coverUrl: string
}

interface Props {
  selectedRowKeys?: any[]
  onOk?: (ids: any[], rows: Item[]) => void
  onSelect?: (record: Item, selected: boolean) => void
  onSelectAll?: (selected: boolean, selectedRows: Item[], changeRows: Item[]) => void
  fetchNode?: 'open' | 'initial'
  // 渠道，1-优选，2-好店，默认优选
  channel: 1 | 2
}
interface State extends PageProps<Item> {
  records: Item[]
  selectedRowKeys: any[]
  selectedRows: Item[]
  visible: boolean
}
export interface SearchPayload {
  productName?: string
  page: number
  pageSize: number
}
class Main extends React.Component<Props, State> {
  public selectedRows: Item[] = []
  public payload: SearchPayload = {
    page: 1,
    pageSize: 10
  }
  public state: State = {
    current: 1,
    size: 10,
    records: [],
    total: 0,
    selectedRows: [],
    selectedRowKeys: this.props.selectedRowKeys || [],
    visible: false
  }
  public columns: ColumnProps<Item>[] = [
    {
      title: '商品ID',
      dataIndex: 'productId'
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      width: 200
    },
    {
      title: '商品主图',
      dataIndex: 'coverUrl',
      render: (text) => {
        return (
          <Image src={text} width={80} height={80} />
        )
      }
    },
    {
      title: '店铺类型',
      key: 'shopType',
      dataIndex: 'shopType',
      render: (val: 1 | 2 | 3 | 4 | 5 | 6 | 7) => shopTypeMap[val]
    },
    {
      title: '库存',
      dataIndex: 'stock'
    }
  ]
  public fetchNode: 'initial' | 'open'
  public constructor (props: Props) {
    super(props)
    this.fetchNode = props.fetchNode || 'initial'
    this.onOk = this.onOk.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.onrowSelectionChange = this.onrowSelectionChange.bind(this)
    this.onSelectAll = this.onSelectAll.bind(this)
  }
  public componentDidMount () {
    if (this.fetchNode === 'initial') {
      this.fetchData()
    }
  }
  public componentWillReceiveProps (props: Props) {
    this.setState({
      selectedRowKeys: props.selectedRowKeys || []
    })
  }
  public fetchData () {
    api.fetchGoodsList({
      ...this.payload,
      channel: this.props.channel
    }).then((res: any) => {
      if (!res) {
        return
      }
      res.current = this.payload.page
      res.records = (res.records || []).map((item: Item) => {
        return {
          ...item,
          productId: item.id,
          id: undefined
        }
      })
      this.setState({
        ...res
      })
    })
  }
  public open (selectedRows: Item[]) {
    if (this.fetchNode === 'open') {
      this.fetchData()
    }
    this.selectedRows = selectedRows.map((item) => {
      return {
        ...item
      }
    })
    const selectedRowKeys = this.selectedRows.map((item) => {
      return item.productId
    })
    this.setState({
      selectedRowKeys,
      visible: true
    })
  }
  public onOk () {
    if (this.props.onOk) {
      this.props.onOk(this.state.selectedRowKeys, this.selectedRows)
      this.setState({
        visible: false
      })
    }
  }
  public onCancel () {
    this.setState({
      visible: false
    })
  }
  public debounceFetch = _.debounce(this.fetchData.bind(this), 500)
  public onSearch (e: any) {
    this.payload.page = 1
    this.payload.productName = e.target.value
    this.debounceFetch()
  }
  public onrowSelectionChange (selectedRowKeys: any[]) {
    this.setState({
      selectedRowKeys
    })
  }
  public onSelect (record: Item, selected: boolean) {
    if (selected) {
      this.selectedRows.push(record)
    } else {
      this.selectedRows = this.selectedRows.filter(item => item.productId !== record.productId);
    }
    if (this.props.onSelect) {
      this.props.onSelect(record, selected)
    }
  }
  public onSelectAll (selected: boolean, selectedRows: Item[], changeRows: Item[]) {
    if (selected) {
      changeRows.map(item => {
        this.selectedRows.push(item)
      })
    } else {
      const ids = changeRows.map(val => val.productId)
      this.selectedRows = this.selectedRows.filter(item => {
        return ids.indexOf(item.productId) === -1
      })
    }
    if (this.props.onSelectAll) {
      this.props.onSelectAll(selected, selectedRows, changeRows)
    }
  }
  public render () {
    const { selectedRowKeys, visible } = this.state
    const rowSelection = {
      onSelect: this.onSelect,
      onChange: this.onrowSelectionChange,
      onSelectAll: this.onSelectAll,
      selectedRowKeys
    }
    return (
      <Modal
        title='选择商品'
        visible={visible}
        width='60%'
        onOk={this.onOk}
        onCancel={this.onCancel}
      >
        <div>
          <Input
            style={{ marginBottom: 20 }}
            placeholder='请选择需要搜索的商品'
            onChange={this.onSearch}
          />
          <Table
            style={{ width: '100%' }}
            rowKey={'productId'}
            rowSelection={rowSelection}
            columns={this.columns}
            dataSource={this.state.records}
            pagination={{
              total: this.state.total,
              pageSize: this.state.size,
              current: this.state.current,
              onChange: (current) => {
                this.payload.page = current
                this.fetchData()
              }
            }}
          />
        </div>
      </Modal>
    )
  }
}
export default Main