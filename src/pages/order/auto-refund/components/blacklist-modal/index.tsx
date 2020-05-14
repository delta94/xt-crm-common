import React from 'react'
import { Form, Input, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { checkCategory } from '../../api'
import styles from './style.module.styl'

const FormItem = Form.Item
const { TextArea } = Input

interface Props extends FormComponentProps {
  levelIds: any
}

class Main extends React.Component<Props> {
  textAreaRef: any
  state = {
    visible: false,
    edit: true,
    productIds: []
  }

  handleCancel = () => {
    this.setState({
      visible: false
    })
  }

  handleOk = () => {
    const { form, levelIds } = this.props
    form.validateFieldsAndScroll((err, { productIds }) => {
      if (err) {
        return
      }
      productIds = productIds.split(/\n/g).map((item: string) => +item)
      checkCategory({
        productIds,
        thirdCategoryId: levelIds[levelIds.length - 1]
      }).then(res => {
        if (!res.errorProductIds.length) {
          Modal.success({
            title: '提示',
            content: '设置黑名单完成'
          })
          return
        }
        Modal.error({
          title: '提示',
          content: res.message
        })
        this.setState({
          edit: false,
          productIds: productIds.map((id: number) => {
            if (res.errorProductIds.includes(id)) {
              return {
                val: id,
                err: true
              }
            }
            return {
              val: id,
              err: false
            }
          })
        })
      })
    })
  }

  show = () => {
    this.setState({
      visible: true
    })
  }

  hide = () => {
    this.setState({
      visible: false
    })
  }

  handleToEdit = () => {
    const { productIds } = this.state
    this.setState({
      edit: true
    }, () => {
      this.props.form.setFieldsValue({
        productIds: productIds.map((item: any) => item.val).join('\n')
      }, () => {
        this.textAreaRef.focus()
      })
    })
  }

  handleAfterClose = () => {
    this.props.form.resetFields()
  }

  render () {
    const {
      form: { getFieldDecorator }
    } = this.props
    const { visible, edit, productIds } = this.state

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 24 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 }
      }
    }

    return (
      <Modal
        title='按商品ID批量设置黑名单'
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        afterClose={this.handleAfterClose}
      >
        {
          edit ? (
            <FormItem {...formItemLayout}>
              {getFieldDecorator('productIds', {
                rules: [
                  {
                    validator: (rule, value, cb) => {
                      const reg = /^\d+(\n\d+)*$/
                      if (!reg.test(value)) {
                        cb('请添加商品Id,并按enter键隔开~(注: 末尾不要留空行)')
                        // return
                      } else {
                        cb()
                      }
                    }
                  }
                ]
              })(
                <TextArea ref={ref => this.textAreaRef = ref} autoSize={{ minRows: 6 }} placeholder='请输入已选择类目下需要设置黑名单的商品ID，以换行区分' />
              )}
            </FormItem>
          ) : (
            <div className={styles.errlist} onClick={this.handleToEdit}>
              {
                productIds.map((item: any, i: number) => (
                  <p
                    key={i}
                    style={{
                      color: item.err ? 'red' : '#000'
                    }}
                  >
                    {item.val}
                  </p>
                ))
              }
            </div>
          )
        }
      </Modal>
    )
  }
}

export default Form.create<Props>()(Main)