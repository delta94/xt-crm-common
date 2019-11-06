import React from 'react';
import { Card, Form, Input, DatePicker, Modal } from 'antd';
import { activityType } from '@/enum';
import { withRouter } from 'react-router';
import moment from 'moment';
import Add from '../add';
import { getPromotionInfo } from '../api';
const FormItem = Form.Item;
class ActivityInfo extends React.Component {
  state = {
    info: {}
  }
  componentDidMount() {
    this.getPromotionInfo();
  }
  async getPromotionInfo() {
    const info = await getPromotionInfo(this.props.match.params.id) || {};
    this.props.changeType(info.type);
    this.setState({ info })
  }
  disabledStartDate = (startTime) => {
    const { form } = this.props;
    const fieldsValue = form.getFieldsValue();
    const endTime = fieldsValue.endTime;
    if (!startTime || !endTime) {
      return false;
    }
    return startTime.valueOf() > endTime.valueOf();
  };

  disabledEndDate = (endTime) => {
    const { form } = this.props;
    const fieldsValue = form.getFieldsValue();
    const startTime = fieldsValue.startTime;
    if (!endTime || !startTime) {
      return false;
    }
    return endTime.valueOf() <= startTime.valueOf();
  };
  handleEdit = () => {
    this.setState({
      info: {
        ...this.state.info,
        visibleAct: true
      }
    })
  }
  handleOk = () => {
    this.setState({
      info: {
        ...this.state.info,
        visibleAct: false
      }
    });
    this.getPromotionInfo();
  }
  handleCancel = () => {
    this.setState({
      info: {
        ...this.state.info,
        visibleAct: false
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form
    const { type, title, isEidt, startTime, endTime, sort } = this.state.info;
    return (
      <>
        <Card
          style={{ marginBottom: 10 }}
          title="活动信息"
          extra={<span className="href" onClick={this.handleEdit}>编辑</span>}
        >
          <Form layout="inline">
            <FormItem label="活动类型">
              {activityType.getValue(type)}
            </FormItem>
            <FormItem label="活动名称">
              {getFieldDecorator('title', {
                initialValue: title,
              })(<Input placeholder="请输入需要编辑的活动名称" disabled={!isEidt} />)}
            </FormItem>
            <FormItem label="开始时间">
              {getFieldDecorator('startTime', {
                initialValue: moment(startTime),
              })(<DatePicker format="YYYY-MM-DD HH:mm:ss" showTime disabled={!isEidt} disabledDate={this.disabledStartDate} />)}
            </FormItem>
            <FormItem label="结束时间">
              {getFieldDecorator('endTime', {
                initialValue: moment(endTime),
              })(<DatePicker format="YYYY-MM-DD HH:mm:ss" showTime disabled={!isEidt} disabledDate={this.disabledEndDate} />)}
            </FormItem>
            <FormItem label="活动排序">
              {getFieldDecorator('sort', {
                initialValue: sort,
              })(<Input placeholder="请输入排序" disabled={!isEidt} />)}
            </FormItem>
          </Form>
        </Card>
        <Modal
          title="活动编辑"
          visible={this.state.info.visibleAct}
          width={1000}
          footer={null}
          onCancel={this.handleCancel}
        >
          <Add data={this.state.info} onOk={this.handleOk} />
        </Modal>
      </>
    );
  }
}
export default withRouter(Form.create({name: 'activityInfo'})(ActivityInfo));