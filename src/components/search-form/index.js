import React, { PureComponent } from 'react';
import { Input, Select, DatePicker, Form, Button, Row, Col } from 'antd';
import { isFunction } from 'lodash';
import { firstLetterToUpperCase, setQuery, parseQuery } from '@/util/utils';
import moment from "moment";
import "./index.scss";
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;

// const dateFormat = 'YYYY-MM-DD HH:mm:ss';
@Form.create()
export default class extends PureComponent {
  componentDidMount() {
    const { form: { setFieldsValue } } = this.props
    setFieldsValue(parseQuery())
  }
  renderInput = (item) => {
    const placeholder = '请输入' + item.label;
    return (
      <Input
        placeholder={placeholder}
        {...item.sourceProps}
      />
    )
  }

  renderDate = (item) => {
    return (
      <RangePicker showTime={{ defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')] }} />
    )
  }

  renderSelect = (item) => {
    const { options } = item;
    console.log('options=>', options);
    const placeholder = '请选择' + item.label;
    return (
      <Select placeholder={placeholder}>
        {
          options.map(({ key, val }) => (<Option value={key} key={key}>{val}</Option>))
        }
      </Select>
    )
  }
  handleSearch = () => {
    const { form: { validateFields }, search, format } = this.props;

    validateFields((errors, values) => {
      if (!errors) {
        // const { customTime = [], ...other } = values;
        let data = values;
        if (format) data = format(data);
        // const payload = {
        //   ...other,
        //   startTime: customTime[0] && customTime[0].unix(),
        //   endTime: customTime[1] && customTime[1].unix(),
        // }
        // setQuery(data);
        search(data);
      }
    });
  }

  resetFields = () => {
    const { form: { resetFields }, clear } = this.props;
    resetFields();
    clear();
  }

  render() {
    const { options = [], form: { getFieldDecorator }, className, children } = this.props;
    return (
      <Form {...{
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        }
      }} className={"i-search-form" + (className ? " " + className : "")}>
        <Row>
          {
            options.map((item, i) => {
              const { type = '', id = '', label = '', config = {}, render } = item;
              const renderFun = isFunction(render) ? render : this[`render${firstLetterToUpperCase(type)}`];
              return (
                <Col span={6} key={i}>
                  <FormItem label={label} key={item.id}>
                    {
                      getFieldDecorator(id, {
                        ...config
                      })(
                        renderFun && renderFun(item)
                      )
                    }
                  </FormItem>
                </Col>
              )
            })
          }
          <Col span={6} style={{ float: 'right' }}>
            <FormItem className='i-search-btns'>
              <Button onClick={this.resetFields}>重置</Button>
              <Button type="primary" onClick={this.handleSearch}>查询</Button>
              {children}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}