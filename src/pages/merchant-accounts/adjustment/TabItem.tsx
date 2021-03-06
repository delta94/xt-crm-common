import React from 'react'
import { Button, Popconfirm, Row, Col, message } from 'antd'
import { FormItem } from '@/packages/common/components/form'
import ListPage, { ListPageInstanceProps } from '@/packages/common/components/list-page'
import Alert, { AlertComponentProps } from '@/packages/common/components/alert'
import Detail from './Detail'
import Auth from '@/components/auth'
import {
  getFieldsConfig,
  TrimTypeEnum,
  TrimStatusEnum,
  CreatedTypeEnum,
  TrimReasonEnum
} from './config'
import * as api from './api'
import { ColumnProps, TableRowSelection } from 'antd/lib/table'
import { ListResponse, ListRequest } from './interface'

interface Props extends Partial<AlertComponentProps> {
  /** 对账单状态 10待采购审核、20待财务审核、30审核通过、40审核不通过、50已失效 */
  status: number
}

interface State {
  selectedRowKeys: any[]
}

class Main extends React.Component<Props, State> {
  public columns: ColumnProps<ListResponse>[] = [
    {
      dataIndex: 'serialNo',
      title: '调整单ID',
      width: 200
    },
    {
      dataIndex: 'trimName',
      title: '名称',
      width: 200
    },
    {
      dataIndex: 'accNo',
      title: '对账单ID',
      width: 200,
      render: (text, record) => {
        return (
          <span
            // href={window.location.pathname + `#/merchant-accounts/checking/${record.accId}`}
            // target='_blank'
            className='href'
            onClick={() => {
              APP.open(`/merchant-accounts/checking/${record.accId}`)
            }}
          >
            {text}
          </span>
        )
      }
    },
    {
      dataIndex: 'trimType',
      title: '调整类型',
      width: 100,
      render: (text) => {
        return TrimTypeEnum[text]
      }
    },
    {
      dataIndex: 'trimReason',
      title: '调整原因',
      width: 150
      // render: (text) => {
      //   return TrimReasonEnum[text]
      // }
    },
    {
      dataIndex: 'trimMoney',
      title: '金额',
      width: 150,
      align: 'center',
      render: (text, record) => {
        const className = record.trimType === 1 ? 'success' : 'error'
        return (
          <span className={className}>
            {text !== 0 ? record.trimType === 1 ? '+' : '-' : ''}
            {APP.fn.formatMoneyNumber(text, 'm2u')}
          </span>
        )
      }
    },
    {
      dataIndex: 'trimStatus',
      title: '状态',
      width: 100,
      render: (text) => {
        return TrimStatusEnum[text]
      }
    },
    {
      dataIndex: 'createName',
      title: '创建人',
      width: 150
    },
    {
      dataIndex: 'createdType',
      title: '创建人类型',
      width: 150,
      render: (text) => {
        return CreatedTypeEnum[text]
      }
    },
    {
      dataIndex: 'createTime',
      title: '创建时间',
      width: 200,
      render: (text) => {
        return APP.fn.formatDate(text)
      }
    },
    {
      dataIndex: 'purchaseReviewName',
      title: '采购审核人',
      width: 150
    },
    {
      dataIndex: 'purchaseReviewTime',
      title: '采购审核时间',
      width: 200,
      render: (text) => {
        return APP.fn.formatDate(text)
      }
    },
    {
      dataIndex: 'financeReviewName',
      title: '财务审核人',
      width: 150
    },
    {
      dataIndex: 'financeReviewTime',
      title: '财务审核时间',
      width: 200,
      render: (text) => {
        return APP.fn.formatDate(text)
      }
    },
    {
      title: '操作',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (text, record) => {
        return (
          <div>
            {(record.trimStatus === 20 && APP.user.menuGathers.indexOf('adjustment:procurement_audit') > -1 || [10, 20].indexOf(record.trimStatus) === -1) && (
              <>
                <span
                  className='href'
                  onClick={() => {
                    this.showAdjustment('view', record)
                  }}
                >
                  查看明细
                </span>&nbsp;&nbsp;
              </>
            )}
            {/* <span className='href'>导出</span>&nbsp;&nbsp; */}
            <Auth>
              {(access: boolean, codes: string[]) => {
                return (record.trimStatus === 10 && codes.indexOf('adjustment:procurement_audit') > -1 || record.trimStatus === 20 && codes.indexOf('adjustment:finance_audit') > -1) && (
                  <>
                    <span
                      className='href'
                      onClick={() => { this.showAdjustment('audit', record) }}
                    >
                      审核
                    </span>&nbsp;&nbsp;
                  </>
                )
              }}
            </Auth>
            {record.trimStatus === 20 && APP.user.id === record.createUid && (
              <Auth code='finance:trim_revoke'>
                <Popconfirm
                  title='确定是否撤销？'
                  onConfirm={this.toRevoke.bind(this, record)}
                >
                  <span className='href'>撤销</span>
                </Popconfirm>
              </Auth>
            )}
            &nbsp;&nbsp;
          </div>
        )
      }
    }
  ]
  public listpage: ListPageInstanceProps
  public payload: Partial<ListRequest>
  public state: State = {
    selectedRowKeys: []
  }
  /** 添加调整单 */
  public showAdjustment (type: 'add' | 'audit' | 'view', record?: ListResponse) {
    if (this.props.alert) {
      const hide = this.props.alert({
        width: 600,
        title: type !== 'add' ? '调整单详情' : '新建调整单',
        content: (
          <Detail
            type={type}
            id={record && record.id}
            onOk={() => {
              this.listpage.refresh()
              hide()
            }}
            onCancel={() => {
              hide()
            }}
          />
        ),
        footer: null
      })
    }
  }
  public toRevoke (record: ListResponse) {
    api.toRevoke(record.id).then(() => {
      this.listpage.refresh()
    })
  }
  public toExport () {
    api.toSearchExport({
      ...this.payload,
      pageNum: undefined,
      pageSize: undefined
    }).then((res) => {
      return message.success('导出成功，请前往下载列表下载文件')
    })
  }
  public onSelectChange = (selectedRowKeys: string[] | number[]) => {
    this.setState({
      selectedRowKeys
    })
  }
  public render () {
    const { selectedRowKeys } = this.state
    const rowSelection: TableRowSelection<ListResponse> = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      columnWidth: 50,
      fixed: true
    }
    return (
      <div>
        <ListPage
          getInstance={(ref) => {
            this.listpage = ref
            // this.addAdjustment()
          }}
          rangeMap={{
            createTime: {
              fields: ['createTimeBegin', 'createTimeEnd']
            }
          }}
          reserveKey={`adjustment${this.props.status}`}
          columns={this.columns}
          formConfig={getFieldsConfig()}
          tableProps={{
            scroll: {
              x: this.columns.map((item) => Number(item.width || 0)).reduce((a, b) => {
                return a + b
              })
            }
          }}
          formItemLayout={(
            <>
              <Row>
                <Col span={6}>
                  <FormItem label='调整单ID' name='serialNo' />
                </Col>
                <Col span={6}><FormItem name='accNo' /></Col>
                <Col span={6}><FormItem name='trimType' /></Col>
                <Col span={6}><FormItem name='purchaseReviewName' /></Col>
              </Row>
              <Row>
                <Col span={6}><FormItem name='trimStatus' /></Col>
                <Col span={6}><FormItem name='createName' /></Col>
                {/* <Col span={6}><FormItem name='trimReason' /></Col> */}
                <Col span={6}><FormItem name='financeReviewName' /></Col>
                <Col span={6}><FormItem name='createType' /></Col>
              </Row>
              <Row>
                <Col span={12}><FormItem name='createTime' /></Col>
                <Col span={6}><FormItem name='supplierName' /></Col>
              </Row>
            </>
          )}
          showButton={false}
          addonAfterSearch={(
            <div>
              <Button
                type='primary'
                className='mr10'
                onClick={() => { this.listpage.fetchData() }}
              >
                查询
              </Button>
              <Button
                className='mr10'
                onClick={() => { this.listpage.refresh(true) }}
              >
                清除
              </Button>
              <Auth code='finance:trim_build'>
                <Button
                  className='mr10'
                  type='primary'
                  onClick={this.showAdjustment.bind(this, 'add', undefined)}
                >
                  新建调整单
                </Button>
              </Auth>
              <Button
                type='primary'
                className='mr10'
                onClick={this.toExport.bind(this)}
              >
                批量导出
              </Button>
              {/* <Button
                type='primary'
                onClick={this.toExport.bind(this, true)}
              >
                全部导出
              </Button> */}
            </div>
          )}
          api={api.fetchList}
          processPayload={(payload) => {
            const status = this.props.status
            console.log(payload, '-----')
            this.payload = {
              ...payload,
              pageNum: payload.page,
              page: undefined,
              trimStatus: payload.trimStatus || (status === 0 ? undefined : status)
            }
            return this.payload
          }}
          processData={(data) => {
            return {
              records: data.result,
              total: data.total
            }
          }}
        />
      </div>
    )
  }
}
export default Alert(Main)
