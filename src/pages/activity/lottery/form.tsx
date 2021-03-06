import React from 'react'
import Form, { FormInstance, FormItem } from '@/packages/common/components/form'
import Ribbon from './components/Ribbon'
import { title, type, statusConfig, formatDate } from './config'
import { Card, DatePicker, Icon, Table, Button } from 'antd'
import { ColumnProps } from 'antd/es/table'
import * as api from './api'
import { parseQuery } from '@/util/utils'
import { disabledDate, disabledDateTime } from '@/util/antdUtil'
interface State {
  roundList: Lottery.LuckyDrawRoundListVo[],
  type: number
}
class Main extends React.Component<any, State> {
  public form: FormInstance
  public id: number
  public timestamp: number;
  public readOnly: boolean = (parseQuery() as any).readOnly === '1'
  public state: State = {
    roundList: [],
    type: 0
  }
  public constructor (props: any) {
    super(props)
    this.id = +props.match.params.id
    this.handleSave = this.handleSave.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }
  public componentDidMount () {
    /** 编辑获取详情 */
    if (this.id !== -1) {
      this.fetchData()
    }
  }
  public async fetchData () {
    const res = await api.getActivityDetail(this.id)
    this.form.setValues(res)
    this.setState({ roundList: res.roundList, type: res.type})
  }

  /** 新建或编辑活动 */
  public handleSave () {
    this.form.props.form.validateFields(async (err, vals) => {
      if (!err) {
        let msg, res
        if (this.id === -1) {
          msg = '新建活动'
          res = await api.saveActivity(vals)
        } else {
          msg = '编辑活动'
          res = await api.updateActivity({id: this.id, ...vals})
        }
        if (res) {
          APP.success(`${msg}成功`)
          this.handleCancel()
        }
      }
    })
  }

  public handleCancel () {
    APP.history.go(-1)
  }

  public render () {
    const columns: ColumnProps<Lottery.LuckyDrawRoundListVo>[] = [
      {
        key: 'No',
        title: '序号',
        render: (arg1, arg2, index: number) => index + 1
      },
      {
        key: 'title',
        title: '场次名称',
        dataIndex: 'title'
      },
      {
        key: 'startTime',
        title: '开始时间',
        dataIndex: 'startTime',
        render: formatDate
      },
      {
        key: 'endTime',
        title: '结束时间',
        dataIndex: 'endTime',
        render: formatDate
      },
      [5, 6].includes(this.state.type) ? {} : {
        key: 'participationTimes',
        title: '参与人数',
        dataIndex: 'participationTimes',
        render: (text: any) => text || 0
      },
      {
        key: 'status',
        title: '状态',
        dataIndex: 'status',
        render: (text: any) => statusConfig[text]
      },
      {
        key: 'operate',
        title: '操作',
        width: 420,
        align: 'center',
        render: (text: any, record: Lottery.LuckyDrawRoundListVo) => {
          const path = `/activity/lottery/${this.id}/${record.id}`
          return (
            <Ribbon
              status={record.status}
              moduleId='sessions'
              type={this.state.type}
              onView={() => APP.history.push(`${path}?readOnly=1&activityType=${this.state.type}`)}
              onEdit={() => {
                const { startTime, type } = this.form && this.form.getValues() || {}
                const stamp = startTime ? startTime.valueOf() : 0
                APP.history.push(`${path}?activityStartTime=${stamp}&activityType=${type}`)
              }}
              onCopy={() => {
                const { startTime, type } = this.form && this.form.getValues() || {}
                const stamp = startTime ? startTime.valueOf() : 0
                APP.history.push(`${path}?activityStartTime=${stamp}&activityType=${type}&copy=true`)
              }}
              onDelete={async () => {
                const res = await api.deleteSession(record.id)
                if (res) {
                  APP.success('删除成功')
                  this.fetchData()
                }
              }}
              onUpdate={async (open: 0 | 1) => {
                const res = await api.updateSessionsStatus({
                  open,
                  luckyDrawRoundId: record.id
                })
                if (res) {
                  const msg = open === 1 ? '开启成功' : '关闭成功' 
                  APP.success(msg)
                  this.fetchData()
                }
              }}
              onJumpToReward ={() => {
                APP.history.push(`/activity/reward?luckyDrawRoundId=${record.id}&roundTitle=${record.title}`)
              }}
            />
          )
        }
      }
    ]
    return (
      <Form
        readonly={this.readOnly}
        getInstance={ref => this.form = ref}
        addonAfter={(
          <div style={{marginTop: 100}}>
            <Button
              disabled={this.readOnly}
              type='danger'
              onClick={this.handleSave}>
              保存
            </Button>
            <Button
              className='ml10'
              onClick={this.handleCancel}
            >
              取消
            </Button>
          </div>
        )}
      >
        <Card title='活动信息'>
          <FormItem
            verifiable
            { ...title }
          />
          <FormItem
            verifiable
            { ...type }
            controlProps={{
              onChange: (type: number) => {
                this.setState({ type })
              }
            }}
          />
          <FormItem
            label='开始时间'
            verifiable
            inner={(form) => {
              const startTime = form.getFieldValue('startTime')
              if (startTime) {
                this.timestamp = startTime.valueOf()
              }
              return (
                <div>
                  {form.getFieldDecorator('startTime', {
                    rules: [{
                      required: true,
                      message: '请输入开始时间'
                    }]
                  })(
                    this.readOnly ? (
                        startTime ?
                          <span>{startTime.format('YYYY-MM-DD HH:mm:ss')}</span> :
                          <></>
                        ) :
                      (
                        <DatePicker
                          disabledDate={(current) => {
                            return disabledDate(current, new Date())
                          }}
                          disabledTime={(current) => {
                            return disabledDateTime(current, new Date())
                          }}
                          showTime
                        />
                      )
                  )}
                  <span className='ml10'>
                    <Icon
                      type='info-circle'
                      theme='filled'
                      style={{
                        color: '#1890ff',
                        marginRight: 4
                      }}
                    />
                    <span>由于场次才是实际活动开始的时间，这里的开始时间相当于预热开始时间。</span>
                  </span>
                </div>
              )
            }}
            fieldDecoratorOptions={{
              rules: [{
                required: true
              }]
            }}
          />
          <div style={{ display: this.state.type <= 4 ? 'block': 'none' }}>
            <FormItem
              name='restrictWinningTimes'
              type='number'
              label='单人中奖次数上限'
              controlProps={{
                style: {
                  width: 195
                },
                min: 0,
                precision: 0
              }}
            />
          </div>
          <FormItem
            name='remark'
            type='textarea'
            label='活动规则'
            verifiable
            controlProps={{
              style: {
                width: 500
              },
              autoSize: {
                minRows: 4
              }
            }}
            fieldDecoratorOptions={{
              rules: [{
                required: true,
                message: '请输入活动规则'
              }]
            }}
          />
        </Card>
        <div className='mt10'>
          <Card
            title={(
              <span>
                <span>场次列表</span>
                <span style={{ color: '#999' }}>（必须先有活动才能新建场次）</span>
              </span>
            )}>
            <Table
              columns={columns}
              rowKey='id'
              pagination={false}
              dataSource={this.state.roundList} />
          </Card>
        </div>
        <div className='mt10'>
          <Button
            type='danger'
            disabled={this.id === -1}
            onClick={() => {
              const type = this.form && this.form.props.form.getFieldValue('type')
              APP.history.push(`/activity/lottery/${this.id}/-1?activityStartTime=${this.timestamp}&activityType=${type}`)
            }}>
            新建场次
          </Button>
        </div>
      </Form>
    )
  }
}

export default Main