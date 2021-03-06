/**
 * 账务调整-内部
 */
import React from 'react'
import classNames from 'classnames'
import Page from '@/components/page'
import Form, { FormInstance, FormItem } from '@/packages/common/components/form'
import { ListPage, Alert } from '@/packages/common/components'
import { ListPageInstanceProps } from '@/packages/common/components/list-page'
import { AlertComponentProps } from '@/packages/common/components/alert'
import { Tooltip, Select, Button, Radio, Upload, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import TextArea from 'antd/lib/input/TextArea'
import BatchModal from './components/uploadModal'
import UploadView from '@/components/upload'
import { formatMoneyWithSign } from '@/pages/helper'
import { exportFile } from '@/util/fetch'
import If from '@/packages/common/components/if'
import { getFieldsConfig } from './config'
import * as api from './api'
import moment from 'moment'
import Payment from './components/payment'
import { ListRecordProps } from './interface'
import AntTableRowSelection from '@/util/AntTableRowSelection'

interface Props extends AlertComponentProps {
}
const dateFormat = 'YYYY-MM-DD HH:mm'
const getFormatDate = (s: any, e: any) => {
  return e ? [moment(s, dateFormat), moment(e, dateFormat)] : []
}

interface State {
  errorUrl: string | null
  selectedRowKeys: any[]
  visible: boolean
  selectedRows: any[]
  tab: "1" | "2"
}

class Main extends AntTableRowSelection<Props, State> {
  public state: State = {
    selectedRows: [],
    errorUrl: null,
    selectedRowKeys: [],
    visible: false,
    tab: "1"
  }
  public rowSelectionKey = 'id'
  public id: any
  public listpage: ListPageInstanceProps
  public columns: ColumnProps<ListRecordProps>[] = [{
    title: '账务结算ID',
    dataIndex: 'id',
    width: 150,
    fixed: 'left'
  }, {
    title: '收支类型',
    dataIndex: 'inOrOutTypeDesc',
    width: 150,
    render: (text: any) => <>{text}</>
  }, {
    dataIndex: 'amount',
    title: '账务金额',
    width: 100,
    render: (text: any, record: any) => {
      text=text/100
      return <div style={{ color: record.inOrOutTypeDesc==='支出'?'red':'green' }}>{text>0?'+'+text:text}</div>
    }
  }, {
    dataIndex: 'subjectTypeDesc',
    title: '账务对象类型',
    width: 150,
    align: 'center'
  }, {
    dataIndex: 'subjectId',
    title: '账务对象ID',
    width: 150
  }, {
    dataIndex: 'subjectName',
    title: '账务对象名称',
    width: 150
  }, {
    dataIndex: 'applicationRemark',
    title: '原因',
    width: 200,
    render: (v:any) => {
      if (v && v !== '0') {
        if (v.length > 10) {
          const base = v.slice(0, 10)
          return <Tooltip title={v}>{base}...</Tooltip>
        } else {
          return v
        }
      }
    }
  }, {
    dataIndex: 'settlementTypeDesc',
    title: '创建方式',
    width: 100
  }, {
    dataIndex: 'auditStatusDesc',
    title: '审核状态',
    width: 100
  }, {
    dataIndex: 'settlementStatusDesc',
    title: '结算状态',
    width: 100,
    align: 'center',
    render: (text) => text || '--'
  }, {
    dataIndex: 'createTime',
    title: '创建时间',
    width: 200,
    render: (text: any) => <>{APP.fn.formatDate(text)}</>
  }, {
    dataIndex: 'creator',
    title: '创建人',
    width: 100
  }, {
    dataIndex: 'auditFinishTime',
    title: '完成时间',
    width: 200,
    render: (text: any) => <>{APP.fn.formatDate(text)}</>
  }, {
    dataIndex: 'auditor',
    title: '操作人',
    width: 100
  },
  {
    title: '操作',
    width: 100,
    fixed: 'right',
    align: 'center',
    render: (text, record) => {
      const { auditStatus, settlementStatus, inOrOutType } = record
      return (
        <>
          {auditStatus === 0 && (
            <span
              className='href mr8'
              onClick={
                this.getDetailData(2, record.id)
              }
            >
              审核
            </span>
          )}
          {auditStatus !== 0 && (
            <span
              className='href mr8'
              onClick={
                this.getDetailData(3, record.id)
              }
            >
              查看
            </span>
          )}
          {settlementStatus === 0 && auditStatus === 1 && inOrOutType === 1 && (
            <span
              className='href'
              onClick={this.toPay.bind(this, record.id)}
            >
              支付
            </span>
          )}
        </>
      )
    }
  }]
  /**
   * 刷新数据
   * @param init - 是否初始化搜索条件 true:是 false:否
   */
  public refresh (init = false) {
    if (init) {
      this.listpage.form.setValues({
        id: undefined,
        subjectId: undefined,
        subjectName: undefined,
        auditStatus: undefined,
        subjectType: undefined,
        inOrOutType: undefined,
        settlementStatus: undefined,
        settlementType: undefined
      })
    }
    this.listpage.form.setValues({
      startTime: moment().subtract(30, 'days').startOf('d'),
      endTime: moment().endOf('d')
    })
    this.listpage.refresh()
  }
  public toOperate = () => () => {
    if (this.props.alert) {
      let form: FormInstance
      const hide = this.props.alert({
        title: '批量审核（请谨慎操作，操作不可逆）',
        content: (
          <Form
            getInstance={(ref) => {
              form = ref
            }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 12 }}
          >
            <FormItem
              label='审核意见'
              verifiable
              inner={(form) => {
                return (form.getFieldDecorator('file')(
                  <Radio.Group>
                    <Radio value={1}>审核通过</Radio>
                    <Radio value={2}>审核不通过</Radio>
                  </Radio.Group>
                )
                )
              }}
              fieldDecoratorOptions={{
                rules: [
                  { required: true, message: '审核意见必填' }
                ]
              }}
            />
            <FormItem
              style={{
                marginBottom: 0
              }}
              label='原因'
              type='textarea'
              name='operateRemark'
              placeholder='请输入原因，140字以内'
              verifiable
              fieldDecoratorOptions={{
                rules: [
                  { required: true, message: '原因必填' },
                  { max: 140, message: '原因最长140个字符' }
                ]
              }}
            />
          </Form>
        ),
        onOk: () => {
          if (form) {
            form.props.form.validateFields((err, values) => {
              if (err) {
                return
              }
              api.add({
              }).then(() => {
                hide()
                this.refresh()
              })
            })
          }
        }
      })
    }
  }

  public validateSubjectId (form: any) {
    const values = (form && form.getValues())||{}
    const subjectId = values.subjectId
    const subjectType = values.subjectType
    if (!subjectId) {
      APP.error('请输入账务对象ID')
      return
    }
    if (!subjectType) {
      APP.error('请选择账务对象类型 ')
      return
    }
    const params={ subjectId, subjectType }
    api.checkSubject(params).then((res: any) => {
      APP.success('校验通过')
      this.id=res.id
      form.setValues({
        subjectName: res.subjectName
      })
    })
  }
  public getDetailData = (type: any, id: any) => () => {
    api.getDetail(id).then((res: any) => {
      res.amount = APP.fn.formatMoneyNumber(res.amount, 'm2u')
      this.operation(type, res)
    })
  }
  // type 1添加，2审核， 3查看
  public operation (type: any, res: any) {
    const readonly=type !== 1
    const uploadProps = readonly ? { showUploadList: { showPreviewIcon: true, showRemoveIcon: false, showDownloadIcon: false } } : { listNum: 5 }
    if (this.props.alert) {
      let form: FormInstance
      const hide = this.props.alert({
        title: type===1 ? '创建账务结算单' : (type===2 ? '审核账务结算单' : '查看账务结算单'),
        width: 700,
        content: (
          <Form
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 12 }}
            getInstance={(ref) => {
              form = ref
              if (res) {
                setTimeout(() => {
                  form.setValues(res)
                }, 100)
              }
            }}
            readonly={readonly}
            onChange={(filed, value) => {
              if (filed === 'subjectId'&&type===1) {
                form.setValues({
                  subjectName: null
                })
              }
            }}
          >
            {type === 3 && (
              <FormItem
                label='账务结算ID'
                readonly
                name='id'
              />
            )}
            <FormItem
              label='收支类型'
              required
              inner={(form) => {
                return readonly?res.inOrOutTypeDesc: (form.getFieldDecorator('inOrOutType', {
                  rules: [
                    { required: true, message: '收支类型必填' }
                  ]
                })(
                  <Select placeholder='请选择收支类型' allowClear >
                    <Select.Option value={1}>收入</Select.Option>
                    <Select.Option value={2}>支出</Select.Option>
                  </Select>
                )
                )
              }}
            />
            <FormItem
              label='账务对象类型'
              required
              inner={(form) => {
                return readonly?res.subjectTypeDesc:(form.getFieldDecorator('subjectType', {
                  rules: [
                    { required: true, message: '账务对象类型必填' }
                  ]
                })(
                  <Select placeholder='请选择账务对象类型' allowClear >
                    <Select.Option value={1}>供应商</Select.Option>
                    <Select.Option value={2}>喜团小店</Select.Option>
                    <Select.Option value={3}>pop店</Select.Option>
                  </Select>
                ))
              }}
            />
            <FormItem
              label='账务对象ID'
              type='input'
              name='subjectId'
              placeholder='请输入账务对象ID'
              verifiable
              wrapperCol={{
                span: readonly ? 12 : 10
              }}
              fieldDecoratorOptions={{
                rules: [
                  { required: true, message: '账务对象ID必填' }
                ]
              }}
              addonAfterCol={{ span: 6 }}
              addonAfter={(!readonly) && (
                <Button
                  className='ml10'
                  onClick={()=>{
                    this.validateSubjectId(form)
                  }}
                >
                  校验
                </Button>
              )}
            />
            <FormItem
              label='账务对象名称'
              type='input'
              required
              verifiable
              name='subjectName'
              disabled={true}
              placeholder='请输入账务对象ID后进行校验'
            />
            <FormItem
              label='账务金额'
              type='number'
              name='amount'
              controlProps={{
                precision: 2,
                min: 0,
                max: 100000000,
                style: {
                  width: 240
                }
              }}
              placeholder='请输入金额，精确到小数点后两位'
              verifiable
              fieldDecoratorOptions={{
                rules: [
                  { required: true, message: '账务金额必填' }
                ]
              }}
            />
            <FormItem
              style={{
                marginBottom: 0
              }}
              label='原因'
              type='textarea'
              name='applicationRemark'
              placeholder='请输入原因，140字以内'
              verifiable
              fieldDecoratorOptions={{
                rules: [
                  { required: true, message: '原因必填' },
                  { max: 140, message: '原因最长140个字符' }
                ]
              }}
            />
            <FormItem
              label='凭证'
              inner={(form) => {
                return (
                  <div>
                    {
                      form.getFieldDecorator('evidenceDocUrlList')(
                        <UploadView
                          multiple
                          disabled={readonly}
                          listType='text'
                          listNum={3}
                          accept='doc,xls'
                          size={10}
                          extname='doc,docx,xls,xlsx'
                          fileTypeErrorText='请上传正确doc、xls格式文件'
                        >
                          <span className={readonly ? 'disabled' : 'href'}>+请选择文件</span>
                        </UploadView>
                      )
                    }
                    <div style={{ color: '#999', fontSize: 10 }}>（支持xls、xlsx、word格式，大小请控制在10MB，最多可上传2个文件）</div>
                    <If condition={this.state.errorUrl?true:false}>
                      <div>
                       上传失败
                        <span className='href' onClick={() => {
                          exportFile(this.state.errorUrl)
                        }}>下载
                        </span>
                      </div>
                    </If>
                  </div>
                )
              }}
            />
            <FormItem
              label='图片'
              inner={(form) => {
                return (
                  <div>
                    {
                      form.getFieldDecorator('evidenceImgUrlList')(
                        <UploadView
                          {...uploadProps}
                          placeholder='上传凭证'
                          listType='picture-card'
                          size={2}
                          disabled={readonly}
                          fileType={['jpg', 'jpeg', 'gif', 'png']}
                          multiple
                        />
                      )
                    }
                    <div style={{ color: '#999', fontSize: 10 }}>（支持jpg、jpeg、png格式，最大2mb，最多可上传5张）</div>
                  </div>
                )
              }}
            />
            {
              <If condition={readonly}>
                <div>
                  <div style={{ borderBottom: '1px solid #333', padding: 8, marginBottom: 15 }}>
                 审核
                  </div>
                  <FormItem
                    label='审核意见'
                    verifiable
                    inner={(form) => {
                      return (form.getFieldDecorator('auditStatus')(
                        <Radio.Group disabled={type===3}>
                          <Radio value={1}>审核通过</Radio>
                          <Radio value={2}>审核不通过</Radio>
                        </Radio.Group>
                      )
                      )
                    }}
                    fieldDecoratorOptions={{
                      rules: [
                        { required: true, message: '审核意见必填' }
                      ]
                    }}
                  />
                  <FormItem
                    style={{
                      marginBottom: 0
                    }}
                    label='原因'
                    inner={(form) => {
                      return (form.getFieldDecorator('auditDesc')(
                        <TextArea maxLength={140} disabled={type===3} placeholder='请输入原因，140字以内' />
                      )
                      )
                    }}
                  />
                </div>

              </If>
            }
          </Form>
        ),
        onOk: () => {
          if (form && type !== 3) {
            form.props.form.validateFields((err, value) => {
              if (err) {
                return
              }
              if (type===1) {
                value.evidenceDocUrlList = (value.evidenceDocUrlList || []).map((item: {name: string, rurl: string}) => {
                  return {
                    url: item.rurl,
                    name: item.name
                  }
                })
                value.evidenceImgUrlList = (value.evidenceImgUrlList || []).map((item: {name: string, rurl: string}) => {
                  return {
                    url: item.rurl,
                    name: item.name
                  }
                })
                if (!value.subjectName) {
                  APP.error('账务对象名称不存在，请输入正确账务对象ID进行校验')
                  return
                }
                value.id=this.id
                api.add(value).then(() => {
                  hide()
                  this.refresh()
                })
              } else if (type===2) {
                if (!value.auditStatus||value.auditStatus===0) {
                  APP.error('请选择审核意见')
                  return
                }
                if (value.auditStatus===2&&!value.auditDesc) {
                  APP.error('请输入原因')
                  return
                }
                const param={ id: res.id, auditStatus: value.auditStatus, auditDesc: value.auditDesc }
                api.audit(param).then(() => {
                  hide()
                  this.refresh()
                })
              }
            })
          } else {
            hide()
          }
        }
      })
    }
  }
  public toPay (id: any) {
    api.createBatchSingle(id).then((res) => {
      const hide = this.props.alert({
        width: 1000,
        title: '支付账单',
        footer: false,
        content: (
          <Payment
            data={res}
            id={id}
            onClose={() => {
              hide()
              this.refresh()
            }}
          />
        )
      })
    })
    // const hide = this.props.alert({
    //   width: 1000,
    //   title: '支付账单',
    //   footer: false,
    //   content: (
    //     <Payment
    //       id={id}
    //       onClose={() => {
    //         hide()
    //         this.refresh()
    //       }}
    //     />
    //   )
    // })
  }
  public toMultiPay () {
    const rows = this.selectedRows
    if (!rows?.length) {
      APP.error('请选择账单')
      return
    }
    api.createBatch(rows.map((item => item.id))).then((res) => {
      const hide = this.props.alert({
        width: 1000,
        title: '支付账单',
        footer: false,
        content: (
          <Payment
            data={res}
            rows={rows}
            onClose={() => {
              hide()
              this.refresh()
            }}
          />
        )
      })
    })

    // if (!this.selectedRows?.length) {
    //   APP.error('请选择支付账单')
    //   return
    // }
    // const hide = this.props.alert({
    //   width: 1000,
    //   title: '支付账单',
    //   footer: false,
    //   content: (
    //     <Payment
    //       // id={id}
    //       rows={this.selectedRows}
    //       onClose={() => {
    //         hide()
    //         this.refresh()
    //       }}
    //     />
    //   )
    // })
  }
  public render () {
    const { selectedRowKeys, tab } = this.state
    const rowSelection = tab === '2' ? {
      ...this.rowSelection,
      // onChange: this.handleSelectionChange,
      // getCheckboxProps: (record: ListRecordProps) => ({
      //   disabled: record.status === 1
      // })
    } : undefined
    return (
      <Page
        style={{
          background: '#FFFFFF'
        }}
      >
        <Tabs
          type="card"
          onChange={(e: any) => {
            this.setState({ tab: e }, () => {
              this.refresh(true)
            })
          }}
        >
          <Tabs.TabPane key='1' tab='全部'></Tabs.TabPane>
          <Tabs.TabPane key='2' tab='待结算'></Tabs.TabPane>
        </Tabs>
        <ListPage
          getInstance={(ref) => this.listpage = ref}
          columns={this.columns}
          rowSelection={rowSelection}
          reserveKey='/finance/accountsettlement'
          mounted={() => {
            const payload = this.listpage.form.getValues()
            this.listpage.form.setValues({
              startTime: payload.startTime || moment().subtract(30, 'days').startOf('d').unix() * 1000,
              endTime: payload.endTime || moment().endOf('d').unix() * 1000
            })
          }}
          tableProps={{
            rowKey: 'id',
            scroll: {
              x: this.columns.reduce((a: any, b:any) => {
                return (typeof a === 'object' ? a.width : a) as any + b.width
              }) as number
            }
          }}
          onReset={() => {
            this.refresh(true)
          }}
          rangeMap={{
            time: {
              fields: ['startTime', 'endTime']
            }
          }}
          addonAfterSearch={(
            <div>
              <Button
                type='primary'
                onClick={()=>{
                  this.operation(1, null)
                }}
              >
              创建账务结算单
              </Button>
              <Button
                type='primary'
                className='ml8 mr8'
                onClick={this.handleBatchShow.bind(this, 'visible')}
              >
                批量创建账务结算单
              </Button>
              {/* <Button
                type='primary'
                onClick={this.toOperate()}
              >
                批量审核
              </Button> */}
              {tab === '2' && (
                <Button
                  type='primary'
                  onClick={this.toMultiPay.bind(this)}
                >
                  发起支付
                </Button>
              )}
            </div>
          )}
          formConfig={getFieldsConfig()}
          formItemLayout={(
            <>
              <FormItem name='id' />
              <FormItem name='subjectId' />
              <FormItem name='subjectName' />
              {tab === "1" && <FormItem name='auditStatus' />}
              <FormItem name='subjectType' />
              {tab === "1" && <FormItem name='inOrOutType' />}
              {tab === "1" && <FormItem name='settlementStatus' />}
              <FormItem name='time' />
              <FormItem name='settlementType' />
            </>
          )}
          api={api.getList}
          processPayload={(payload) => {
            this.selectedRows = []
            this.setState({
              selectedRowKeys: []
            })
            payload.startTime =  payload.startTime || moment().subtract(30, 'days').startOf('d').unix() * 1000
            payload.endTime = payload.endTime || moment().endOf('d').unix() * 1000
            if (tab === '2') {
              return {
                ...payload,
                auditStatus: 1,
                inOrOutType: 1,
                settlementStatus: 0,
              }
            }
            return {
              ...payload
            }
          }}
        />
        <BatchModal
          modalProps={{
            visible: this.state.visible,
            onCancel: this.handleCancel.bind(this, 'visible')
          }}
        />
      </Page>
    )
  }

  // 模态框取消操作
  handleCancel = (key: 'visible') => {
    this.setState({
      [key]: false
    })
  }
  // 显示批量模态框
  handleBatchShow = (key: 'visible') => {
    this.setState({
      [key]: true
    })
  }
}
export default Alert(Main)
