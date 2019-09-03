import React from 'react'
import { Form, Input, Button, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
interface Props extends FormComponentProps {
  className?: string
  onChange?: (value: any) => void
}
class Main extends React.Component<Props> {
  public constructor (props: Props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  public handleSubmit () {
    this.props.form.validateFields((err, value: Special.SearchProps) => {
      if (this.props.onChange) {
        console.log(value, 'value')
        value.status = [0, 1].indexOf(value.status as number) === -1 ? undefined : value.status
        this.props.onChange(value)
      }
    })
  }
  public render () {
    const { getFieldDecorator } = this.props.form
    return (
      <div
        style={{
          display: 'inline-block',
          verticalAlign: 'middle'
        }}
        className={this.props.className}
      >
        <Form layout="inline">
          <Form.Item
            label='banner名称'
          >
            {getFieldDecorator('title')(
              <Input placeholder='请输入banner名称' />
            )}
          </Form.Item>
          <Form.Item
            label='位置'
          >
            {getFieldDecorator('b')(
              <Input placeholder='请选择位置' />
            )}
          </Form.Item>
          <Form.Item
            label='状态'
          >
            {getFieldDecorator('status')(
              <Select style={{width: 100}}>
                <Select.Option value={1}>开启</Select.Option>
                <Select.Option value={0}>关闭</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            <Button
              style={{marginRight: 10}}
              type="primary"
              onClick={this.handleSubmit}
            >
              查询
            </Button>
            <Button
              onClick={() => {
                this.props.form.resetFields()
              }}
            >
              重置
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}
export default Form.create()(Main)