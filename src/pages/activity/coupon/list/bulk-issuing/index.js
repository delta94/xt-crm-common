import React, { useState } from 'react';
import { formItemLayout, formButtonLayout } from '@/config';
import { DatePicker, Row, Col, Card, Form, Checkbox, Input, Button, Radio } from 'antd';

// 批量发券
function BulkIssuing({ form: { getFieldDecorator } }) {
  console.log(getFieldDecorator)
  const [targetUsersKey, setTargetUsersKey] = useState(1)
  const [sendingTimeKey, setSendingTimeKey] = useState(1)
  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  }
  return (
    <Card>
      <Form {...formItemLayout}>
        <Form.Item label="优惠券名称">中秋国庆发券</Form.Item>
        <Form.Item label="目标用户">
          <Radio.Group onChange={event => setTargetUsersKey(event.target.value)} value={targetUsersKey}>
            <Radio style={radioStyle} value={1}>全部用户</Radio>
            <Radio style={radioStyle} value={2}>按用户等级<Button type="link">选择等级</Button></Radio>
            {targetUsersKey === 2 &&　<Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={8}>
                  <Checkbox value="普通用户">普通用户</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="团长">团长</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="体验团长">体验团长</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="星级团长">星级团长</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="社区管理员">社区管理员</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="城市合伙人">城市合伙人</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>}
            <Radio style={radioStyle} value={3}>指定用户</Radio>
            <Input.TextArea style={{width: '528px'}} rows={4} placeholder="输入用户手机号，以半角逗号隔开，例13928387247,15619237922"/>
            <Button type="link">上传excel</Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="发送时间">
          <Radio.Group onChange={event => setSendingTimeKey(event.target.value)} value={sendingTimeKey}>
            <Radio style={radioStyle} value={3}>立即发送</Radio>
            <Radio style={radioStyle} value={4}>定时发送</Radio>
            <div>
              选择时间：<DatePicker format="YYYY-MM-DD HH:mm:ss"/>
            </div>
          </Radio.Group>
        </Form.Item>
        <Form.Item {...formButtonLayout}>
          <Button type="primary">保存</Button>
          <Button>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
export default Form.create({ name: 'bulk-issuing' })(BulkIssuing);