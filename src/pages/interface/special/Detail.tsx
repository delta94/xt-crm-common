import React from 'react'
import CouponCard from './components/content/Card'
import { Input, Button, Card, Switch, Radio, AutoComplete } from 'antd'
import { withRouter, RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import Upload from '@/components/upload'
import * as api from './api'
import styles from './style.module.sass'
import { namespace } from './model'
import classnames from 'classnames'
import Form, { FormItem, FormInstance } from '@/packages/common/components/form'
import AutoComplateSpec from './components/AutoComplateSpec'

interface Props extends RouteComponentProps<{ id: any }> {
  detail: Special.DetailItem
}
interface State {
  shareOpen: boolean;
  type: 1 | 2
}
class Main extends React.Component<Props, State> {
  public state: State = {
    shareOpen: true,
    type: 1
  }
  public id: number = -1
  public form: FormInstance
  public constructor(props: Props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  public componentDidMount() {
    this.id = +this.props.match.params.id
    if (this.id === -1) {
      this.setState({ shareOpen: true })
    } else {
      this.fetchData()
    }
  }
  /** 组件卸载清空状态 */
  public componentWillUnmount() {
    APP.dispatch({
      type: `${namespace}/@@init`
    })
  }
  /** crm查看专题活动详情 */
  public fetchData() {
    APP.dispatch({
      type: `${namespace}/fetchDetail`,
      payload: {
        id: this.id,
        cb: (result: any) => {
          this.setState({
            shareOpen: result.shareOpen === 1
          })
        }
      }
    })
  }
  handleSwitch = (checked: boolean) => {
    this.setState({ shareOpen: checked });
  }
  /** 新增、编辑专题 */
  public handleSubmit(e: any) {
    e.preventDefault()
    this.form.props.form.validateFields((err: any, value) => {
      if (err) {
        return
      }
      if (value.imgUrl instanceof Array) {
        value.imgUrl = value.imgUrl[0] && value.imgUrl[0].url
      }
      if (value.shareImgUrl instanceof Array) {
        value.shareImgUrl = value.shareImgUrl[0] && value.shareImgUrl[0].url
      }
      const params = {
        ...this.props.detail,
        ...value,
        shareOpen: this.state.shareOpen ? 1 : 0
      };
      api.saveSpecial(params).then((res: any) => {
        if (res !== undefined) {
          APP.success(`专题${this.id === -1 ? '新增' : '修改'}成功`)
          APP.history.push('/interface/special')
        }
      })
    })
  }
  public get imgUrl(): string | { uid: string, url: string }[] {
    const { detail } = this.props
    return typeof detail.imgUrl === 'string' ? [
      {
        uid: 'imgUrl0',
        url: detail.imgUrl
      }
    ] : detail.imgUrl;
  }
  public get shareImgUrl(): string | { uid: string, url: string }[] {
    const { detail } = this.props
    return typeof detail.shareImgUrl === 'string' ? [
      {
        uid: 'imgUrl0',
        url: detail.shareImgUrl
      }
    ] : detail.shareImgUrl;
  }
  /** 跳转到专题管理 */
  public handleJumpTo () {
    APP.history.push('/interface/special-content')
  }
  public render() {
    const { detail } = this.props
    return (
      <div className={styles.detail}>
        <div className={styles.content}>
          <Form
            getInstance={ref => this.form = ref}
            className={styles.form}
            onSubmit={this.handleSubmit}
          >
            <FormItem
              name='subjectName'
              label='名称'
              verifiable
              fieldDecoratorOptions={{
                initialValue: detail.subjectName,
                rules: [
                  { required: true, message: '名称不能为空' }
                ]
              }}
            />
            <FormItem
              label='支持专题分享'
              inner={(form) => {
                return form.getFieldDecorator('shareOpen')(
                  <>
                    <Switch checked={this.state.shareOpen} onChange={this.handleSwitch} />
                    <p>关闭专题分享时，则隐藏专题页面分享按钮，无法分享专题。</p>
                  </>
                )
              }}
            />
            {this.state.shareOpen &&
              <>
                <FormItem
                  name='shareTitle'
                  label='分享标题'
                  verifiable
                  fieldDecoratorOptions={{
                    initialValue: detail.shareTitle,
                    rules: [
                      { required: true, message: '分享标题不能为空' },
                      {
                        max: 30,
                        message: '分享标题不能超过30个字符'
                      }
                    ]
                  }}
                />
                <FormItem
                  label='分享图片'
                  required
                  inner={(form) => {
                    return (
                      <>
                        {form.getFieldDecorator('shareImgUrl', {
                          initialValue: this.shareImgUrl,
                          rules: [
                            { required: true, message: '请上传专题分享图片' }
                          ]
                        })(
                          <Upload
                            accept='image/gif, image/jpeg, image/png'
                            size={0.3}
                            listType='picture-card'
                          />
                        )}
                        <p>1.专题分享图片主要用于专题分享，包括生成专题海报、分享给好友图片等，必填项。</p>
                        <p>2、图片格式支持png、gif、jpg格式（推荐使用png格式）。</p>
                        <p>3、图片尺寸为750*1000像素，大小不超过300kb。</p>
                      </>
                    )
                  }}
                />
              </>
            }
            <FormItem
              name='backgroundColor'
              label='专题背景色'
              placeholder='请输入背景色，如#FFFFFF'
              verifiable
              fieldDecoratorOptions={{
                initialValue: detail.backgroundColor,
                rules: [
                  { required: true, message: '专题背景色不能为空' }
                ]
              }}
            />
            <FormItem
              label='banner图片'
              required
              inner={(form) => {
                return form.getFieldDecorator('imgUrl', {
                  initialValue: this.imgUrl,
                  rules: [{
                    required: true,
                    message: 'banner图片不能为空'
                  }]
                })(
                  <Upload
                    size={0.3}
                    listType='picture-card'
                  />
                )
              }}
            />
            <FormItem
              name='jumpUrl'
              label='链接'
              verifiable
              fieldDecoratorOptions={{
                initialValue: detail.jumpUrl,
                rules: [
                  { required: true, message: '请输入正确的链接地址' }
                ]
              }}
            />
            <div className={styles['spec-type-title']}>
              <span className='mr10'>专题类型</span>
              <Radio.Group
                value={this.state.type}
                onChange={(e) => this.setState({ type: e.target.value})}>
                <Radio value={1}>一般类型</Radio>
                <Radio value={2}>多类目类型</Radio>
              </Radio.Group>
            </div>
            {/* 一般类型 */}
            {this.state.type === 1 && (
              <Card style={{ marginTop: 0 }}>
                <FormItem
                  label='绑定专题内容'
                  inner={(form) => {
                    return (
                      <>
                        {form.getFieldDecorator('floorId', {
                          initialValue: detail.floorId
                        })(
                          <AutoComplateSpec
                            controlProps={{
                              style: { width: 220 },
                              placeholder: '请输入专题内容标题关键字'
                            }}
                          />
                        )}
                        <span
                          className={classnames('ml10', styles['download'])}
                          onClick={this.handleJumpTo}
                        >
                          专题管理
                        </span>
                      </>
                    )
                  }}
                />
              </Card>
            )}
            {/* 多类目类型 */}
            {this.state.type === 2 && (
              <>
                <Card style={{ marginTop: 0 }}>
                  <p>类目通用优惠券</p>
                  <CouponCard
                    detail={{
                      type: 2,
                      sort: '',
                      list: []
                    }}
                    onChange={(value: any) => {
                      
                    }}
                  />
                </Card>
                <Card>
                  <FormItem
                    name='css'
                    label='类目样式'
                    type='radio'
                    options={[{
                      label: '横排',
                      value: 1
                    }, {
                      label: '竖排',
                      value: 2
                    }]}
                  />
                  <FormItem
                    label='类目列表'
                  >

                  </FormItem>
                  <FormItem
                    name='categoryName'
                    label='类目名称'
                    controlProps={{
                      style: {
                        width: 220
                      }
                    }}
                  />
                  <FormItem
                    name='sort'
                    label='排序'
                    controlProps={{
                      style: {
                        width: 220
                      }
                    }}
                  />
                  <FormItem
                    label='绑定专题内容'
                    inner={(form) => {
                      return (
                        <>
                          {form.getFieldDecorator('specName')(
                            <AutoComplete
                              placeholder='请输入专题内容标题关键字'
                              style={{ width: 220 }}
                            />
                          )}
                          <span className={classnames('ml10', styles['download'])}>专题管理</span>
                        </>
                      )
                    }}
                  />
                </Card>
                <Card>
                  <FormItem
                    name='categoryName'
                    label='类目名称'
                    controlProps={{
                      style: {
                        width: 220
                      }
                    }}
                  />
                  <FormItem
                    name='sort'
                    type='number'
                    label='排序'
                    controlProps={{
                      style: {
                        width: 220
                      },
                      min: 0
                    }}
                  />
                  <FormItem
                    label='绑定专题页'
                    inner={(form) => {
                      return (
                        <>
                          {form.getFieldDecorator('specName')(
                            <Input
                              style={{ width: 220 }}
                              placeholder='请输入专题'
                            />
                          )}
                          <span className={classnames('ml10', styles['download'])}>编辑详情</span>
                          <span className={classnames('ml10', styles['download'])}>解除绑定</span>
                          <span className={classnames('ml10', styles['download'])}>专题管理</span>
                        </>
                      )
                    }}
                  />
                </Card>
              </>
            )}
            <div className={styles.footer}>
              <Button
                type='primary'
                htmlType='submit'
                style={{ marginRight: 20 }}
              >
                保存
              </Button>
              <Button
                onClick={() => {
                  APP.history.push('/interface/special')
                }}
              >
                取消
              </Button>
            </div>
          </Form>
        </div>
      </div>
    )
  }
}
export default connect((state: any) => {
  return {
    detail: state[namespace].detail
  }
})(withRouter(Main))
