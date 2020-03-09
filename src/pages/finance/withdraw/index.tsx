import React from 'react';
import { ListPage, Form, FormItem, Alert, If } from '@/packages/common/components';
import { getRemittanceList, exportList, submitRemittance, cancelRemittance, batchSubmit, getRemittanceInfo } from './api';
import { defaultConfig, NAME_SPACE } from './config';
import { Button, Modal, DatePicker } from 'antd';
import { ListPageInstanceProps } from '@/packages/common/components/list-page';
import { AlertComponentProps } from '@/packages/common/components/alert';
import { FormInstance } from '@/packages/common/components/form';
import { parseQuery } from '@/util/utils';
import { formatMoneyWithSign } from '../../../pages/helper';
import moment from 'moment';
import { pick } from 'lodash';

const { RangePicker } = DatePicker;
interface WithdrawState {
  batchId: string,
  commonNum: number,
  interceptionAmount: number,
  interceptionNum: number,
  totalAmount: number,
  totalNum: number,
  commonAmount: number
}
/**
 * 提现管理列表
 */
class Withdraw extends React.Component<AlertComponentProps, WithdrawState> {
  list: ListPageInstanceProps;
  form: FormInstance;
  batchPaymentForm: FormInstance;
  batchId = (parseQuery() as any).batchId;
  state: WithdrawState = {
    batchId: '',
    commonNum: 0,
    interceptionAmount: 0,
    interceptionNum: 0,
    totalAmount: 0,
    totalNum: 0,
    commonAmount: 0
  }
  columns = [{
    title: '提现单号',
    dataIndex: 'transferNo'
  }, {
    title: '提现类型',
    dataIndex: 'moneyAccountTypeDesc'
  }, {
    title: '申请人账号',
    dataIndex: 'memberMobile'
  }, {
    title: '申请时间',
    dataIndex: 'createTime'
  }, {
    title: '提交时间',
    dataIndex: 'submitTime'
  }, {
    title: '提现金额',
    dataIndex: 'transferAmount',
    render: (text: any) => <>{formatMoneyWithSign(text)}</>,
  }, {
    title: '服务费',
    dataIndex: 'serviceCharge',
    render: (text: any) => <>{formatMoneyWithSign(text)}</>,
  }, {
    title: '银行卡绑定人',
    dataIndex: 'realName'
  }, {
    title: '银行卡号',
    dataIndex: 'bankCardNo'
  }, {
    title: '身份证号',
    dataIndex: 'idCardNo'
  }, {
    title: '提现状态',
    dataIndex: 'transferStatusDesc'
  }, {
    title: '操作',
    width: 220,
    fixed: 'right',
    render: (records: any) => {
      return (
        <>
          <span
            className='href'
            onClick={() => {
              APP.history.push(`/finance/withdraw/${records.id}?readOnly=1`);
            }}
          >
            查看详情
          </span>
          <If condition={records.transferStatus === 0}>
            <span
              className='href ml10'
              onClick={() => {
                Modal.confirm({
                  title: '是否提交打款？',
                  content: '确认后将会打款给对应用户',
                  onOk: () => {
                    submitRemittance(records.id).then(res => {
                      if (res) {
                        APP.success('提交打款成功');
                        this.list.refresh();
                      }
                    })
                  }
                })
              }}>提交打款</span>
            <span
              className='href ml10'
              onClick={() => {
                this.props.alert({
                  title: '是否取消提现？',
                  content: (
                    <Form
                      getInstance={ref => this.form = ref}
                      labelCol={{ span: 0 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <FormItem
                        placeholder='请输入取消原因（用户可见）*必填'
                        type='textarea'
                        name='remark'
                        verifiable
                        fieldDecoratorOptions={{
                          rules: [{
                            required: true,
                            message: '请输入取消原因（用户可见）*必填'
                          }]
                        }}
                        controlProps={{
                          rows: 5,
                          maxLength: 200
                        }}
                      />
                    </Form>
                  ),
                  onOk: (hide) => {
                    this.form.props.form.validateFields((err, vals) => {
                      if (!err) {
                        cancelRemittance({
                          id: records.id,
                          remark: vals.remark
                        }).then(res => {
                          if (res) {
                            APP.success('取消提现成功');
                            this.list.refresh();
                            hide();
                          }
                        })
                      }
                    })
                  }
                })
              }}
            >
              取消提现
            </span>
          </If>
        </>
      )
    }
  }];
  componentDidMount() {
    const form = this.list.form;
    if (form && this.batchId) {
      form.setValues({ batchId: this.batchId });
      this.list.fetchData();
    } else {
      this.list.refresh();
    }
  }
  onChange = (value: [moment.Moment, moment.Moment]) => {
    if (!value[0] || !value[1]) return;
    getRemittanceInfo({
      startTime: value[0].format('YYYY-MM-DD'),
      endTime: value[1].format('YYYY-MM-DD')
    }).then(res => {
      if (res) {
        this.setState(pick(res, ['commonAmount', 'commonNum', 'interceptionAmount', 'interceptionNum', 'totalAmount', 'totalNum', 'batchId']))
      }
    })
  }
  submitPayment = () => {
    this.props.alert({
      width: 600,
      title: (
        <div style={{ textAlign: 'center' }}>
          <div>按申请日期提交打款</div>
          <div>提交后将会打款给对应用户</div>
        </div>
      ),
      content: (
        <div>
          <Form
            getInstance={ref => this.batchPaymentForm = ref}
            rangeMap={{
              dateRange: {
                fields: ['startTime', 'endTime']
              }
            }}
          >
            <FormItem
              label='申请时间'
              required
              inner={(form) => {
                return form.getFieldDecorator('dateRange', {
                  getValueFromEvent: (e) => {
                    let value: any;
                    if (!e || !e.target) {
                      value = e;
                    } else {
                      const { target } = e;
                      value = target.type === 'checkbox' ? target.checked : target.value;
                    }
                    this.onChange(value);
                    return value;
                  },
                  rules: [{
                    required: true,
                    message: '请选择申请时间'
                  }]
                })(
                  <RangePicker showTime format="YYYY/MM/DD"/>
                )
              }}
            />
            <FormItem
              inner={(form) => {
                const { commonNum, interceptionNum, commonAmount, interceptionAmount, totalNum, totalAmount } = this.state;
                const { startTime, endTime } = this.batchPaymentForm.getValues();
                const hasValue = startTime && endTime;
                return (
                  <>
                    <div>所选日期待提现条目数目：{hasValue ? `${totalNum}（普通提现${commonNum} 拦截提现${interceptionNum}）` : '-'}</div>
                    <div>所选日期待提现金额：{hasValue ? `${formatMoneyWithSign(totalAmount)}（普通提现${formatMoneyWithSign(commonAmount)} 拦截提现${formatMoneyWithSign(interceptionAmount)}）` : '-'}</div>
                  </>
                )
              }}
            />
          </Form>
        </div>
      ),
      onOk: (hide) => {
        const { batchId } = this.state;
        this.batchPaymentForm.props.form.validateFields((err) => {
          const vals = this.batchPaymentForm.getValues();
          if (!err) {
            batchSubmit({
              batchId,
              startTime: moment(vals.startTime).format('YYYY-MM-DD'),
              endTime: moment(vals.endTime).format('YYYY-MM-DD')
            }).then(res => {
              if (res) {
                APP.success('批量打款成功');
              }
            })
          }
        })
      }
    })
  }

  getRemittanceList = async (data: any) => {
    if (data.submitTime) {
      if (data.submitTime[0]) {
        data.remitStartTime = data.submitTime[0].format('YYYY-MM-DD')
      }
      if (data.submitTime[1]) {
        data.remitEndTime = data.submitTime[1].format('YYYY-MM-DD')
      }
      delete data.submitTime;
    }
    if (data.createTimeBegin) {
      data.createStartTime = data.createTimeBegin.substr(0, 10)
      delete data.createTimeBegin;
    }
    if (data.createTimeEnd) {
      data.createEndTime = data.createTimeEnd.substr(0, 10)
      delete data.createTimeEnd;
    }
    return getRemittanceList(data);
  }

  render() {
    return (
      <>
        <ListPage
          autoFetch={false}
          tableProps={{
            scroll: {
              x: true
            }
          }}
          namespace={NAME_SPACE}
          formItemLayout={( 
            <>
              <FormItem
                name='batchId'
                hidden={!this.batchId}
              />
              <FormItem name='transferNo' />
              <FormItem name='moneyAccountType' />
              <FormItem name='transferStatus' />
              <FormItem name='memberMobile' />
              <FormItem name='createTime' />
              <FormItem name='submitTime' />
              <FormItem name='bankCardNo' />
              <FormItem name='idCardNo' />
            </>
          )}
          getInstance={(ref) => {
            this.list = ref;
          }}
          addonAfterSearch={(
            <>
              <Button type='primary' onClick={() => APP.history.push('/finance/withdraw/records')}>批次记录</Button>
              <Button type='primary' className='ml10' onClick={this.submitPayment}>按申请日期提交打款</Button>
              <Button type='primary' className='ml10' onClick={() => exportList(this.list.payload)}>导出表格</Button>
            </>
          )}
          formConfig={defaultConfig}
          columns={this.columns}
          api={this.getRemittanceList}
        />
      </>
    )
  }
}

export default Alert(Withdraw);